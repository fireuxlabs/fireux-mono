// Concurrent edit — 2026-07-20 18:25 CEST — Repo Efficiency Pass 2 of 6: provision App-enabled profiles and ordered indexes through one trusted transaction seam.

import { useRuntimeConfig } from '#imports'
import {
  type DocumentReference,
  type Firestore,
} from 'firebase-admin/firestore'
import { createError, defineEventHandler } from 'h3'
import { AppStorage } from '../../../models/core/app.model'
import type { ProfileProvisionResult } from '../../../models/operations/profile-provisioning'
import { AppUserStorage, UserStorage } from '../../../models/core/user.model'
import { isRuntimeProfileEnabled } from '../../../utils/profile-index'
import { requireFirebaseBearerUser } from '../auth/bearer'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../getRuntimeFirestore'

import {
  buildAppProfileProvisionData as appProfileData,
  assertProfileProvisionDefinition as assertDefinition,
  assertProfileProvisionSeed as assertSeed,
  requireProfileProvisionSegment as configuredSegment,
  failProfileProvision as fail,
  requireProfileProvisionAppMembership as requireAppMembership,
  requireProfileProvisionCanonicalUser as requireCanonicalUser,
  buildRootProfileProvisionData as rootProfileData,
  type ProfileProvisionContractDefinition as ProfileProvisionDefinition,
  type ProfileProvisionContractSeed as ProfileProvisionSeed,
  type ProfileProvisionTransactionOutcome as ProfileTransactionOutcome,
} from './profile-provision-contract'

export type {
  ProfileProvisionContractDefinition as ProfileProvisionDefinition,
  ProfileProvisionContractSeed as ProfileProvisionSeed,
} from './profile-provision-contract'

function runtimeDatabaseContext(definition: ProfileProvisionDefinition) {
  const runtime = useRuntimeConfig()
  const fireux = runtime.public?.fireux as Record<string, unknown> | undefined
  const firebase = runtime.public?.firebaseEcosystem?.firebase as
    | Record<string, unknown>
    | undefined
  const appId = configuredSegment(fireux?.id, 'Runtime App id')

  if (!isRuntimeProfileEnabled(fireux?.profiles, definition.id)) {
    fail(404, `${definition.label} profiles are not enabled for this App.`)
  }

  const appDatabaseId = String(firebase?.databaseId ?? '').trim()
  const configuredIdentityDatabaseId = String(
    firebase?.identityDatabaseId ?? ''
  ).trim()
  const identityDatabaseId = configuredIdentityDatabaseId || appDatabaseId
  const canonicalAppDatabaseId =
    appDatabaseId === '(default)' ? '' : appDatabaseId
  const canonicalIdentityDatabaseId =
    identityDatabaseId === '(default)' ? '' : identityDatabaseId

  return {
    appId,
    appDatabaseId,
    identityDatabaseId,
    appDb: getRuntimeFirestore(appDatabaseId),
    identityDb: getRuntimeIdentityFirestore(identityDatabaseId),
    sameDatabase: canonicalAppDatabaseId === canonicalIdentityDatabaseId,
  }
}

function profileRefs(
  definition: ProfileProvisionDefinition,
  uid: string,
  appId: string,
  identityDb: Firestore,
  appDb: Firestore
) {
  return {
    user: identityDb.collection(UserStorage.collection).doc(uid),
    root: definition.root
      ? identityDb.collection(definition.root.collection).doc(uid)
      : null,
    membership: appDb
      .collection(AppStorage.collection)
      .doc(appId)
      .collection(AppUserStorage.collection)
      .doc(uid),
    app: appDb
      .collection(AppStorage.collection)
      .doc(appId)
      .collection(definition.app.collection)
      .doc(uid),
  }
}

async function provisionSingleDatabase(
  definition: ProfileProvisionDefinition,
  uid: string,
  appId: string,
  db: Firestore,
  rootSeed: ProfileProvisionSeed | null,
  appSeed: ProfileProvisionSeed
): Promise<ProfileTransactionOutcome> {
  const refs = profileRefs(definition, uid, appId, db, db)

  return db.runTransaction(async (transaction) => {
    const reads: DocumentReference[] = [refs.user, refs.membership]
    if (refs.root) reads.push(refs.root)
    reads.push(refs.app)
    const snapshots = await transaction.getAll(...reads)
    let cursor = 0
    const userSnapshot = snapshots[cursor++]!
    const membershipSnapshot = snapshots[cursor++]!
    const rootSnapshot = refs.root ? snapshots[cursor++]! : null
    const appSnapshot = snapshots[cursor]!
    requireCanonicalUser(userSnapshot)
    requireAppMembership(membershipSnapshot)
    const createdCore = Boolean(
      refs.root && rootSnapshot && !rootSnapshot.exists
    )
    const createdApp = !appSnapshot.exists

    if (refs.root && rootSnapshot && !rootSnapshot.exists) {
      transaction.create(refs.root, rootProfileData(rootSeed ?? {}, uid))
    }
    if (!appSnapshot.exists) {
      transaction.create(refs.app, appProfileData(appSeed, uid, appId))
    }

    return { createdCore, createdApp }
  })
}

async function provisionIdentityPhase(
  uid: string,
  db: Firestore,
  userRef: DocumentReference,
  rootRef: DocumentReference,
  rootSeed: ProfileProvisionSeed
) {
  return db.runTransaction(async (transaction) => {
    const [userSnapshot, rootSnapshot] = await transaction.getAll(
      userRef,
      rootRef
    )
    requireCanonicalUser(userSnapshot)
    const createdCore = !rootSnapshot.exists

    if (createdCore) {
      transaction.create(rootRef, rootProfileData(rootSeed, uid))
    }

    return createdCore
  })
}

async function provisionAppPhase(
  uid: string,
  appId: string,
  db: Firestore,
  membershipRef: DocumentReference,
  appRef: DocumentReference,
  appSeed: ProfileProvisionSeed
) {
  return db.runTransaction(async (transaction) => {
    const [membershipSnapshot, appSnapshot] = await transaction.getAll(
      membershipRef,
      appRef
    )
    requireAppMembership(membershipSnapshot)
    const createdApp = !appSnapshot.exists

    if (createdApp) {
      transaction.create(appRef, appProfileData(appSeed, uid, appId))
    }

    return createdApp
  })
}

export async function provisionRuntimeProfile(
  actorUid: string,
  definition: ProfileProvisionDefinition
): Promise<ProfileProvisionResult> {
  assertDefinition(definition)
  const uid = configuredSegment(actorUid, 'Authenticated User id')
  const context = runtimeDatabaseContext(definition)
  const rootSeed = definition.root
    ? assertSeed(definition.root.seed(), `${definition.label} root seed`)
    : null
  const appSeed = assertSeed(
    definition.app.seed(),
    `${definition.label} App seed`
  )

  if (context.sameDatabase) {
    const outcome = await provisionSingleDatabase(
      definition,
      uid,
      context.appId,
      context.appDb,
      rootSeed,
      appSeed
    )
    return {
      ok: true,
      userId: uid,
      profileId: definition.id,
      ...outcome,
      atomicity: 'single-database-atomic',
    }
  }

  const refs = profileRefs(
    definition,
    uid,
    context.appId,
    context.identityDb,
    context.appDb
  )
  const [userSnapshot, membershipSnapshot] = await Promise.all([
    refs.user.get(),
    refs.membership.get(),
  ])
  requireCanonicalUser(userSnapshot)
  requireAppMembership(membershipSnapshot)

  let createdCore = false
  if (definition.root && refs.root && rootSeed) {
    createdCore = await provisionIdentityPhase(
      uid,
      context.identityDb,
      refs.user,
      refs.root,
      rootSeed
    )
  }

  let createdApp: boolean
  try {
    createdApp = await provisionAppPhase(
      uid,
      context.appId,
      context.appDb,
      refs.membership,
      refs.app,
      appSeed
    )
  } catch (cause) {
    if (!definition.root) throw cause
    throw createError({
      statusCode: 409,
      statusMessage:
        `${definition.label} identity is ready, but its current App attachment ` +
        'did not complete. Restore App membership if needed, then retry.',
      data: {
        code: 'PROFILE_APP_PHASE_INCOMPLETE',
        retryable: true,
        userId: uid,
        profileId: definition.id,
        createdCore,
      },
      cause,
    })
  }

  return {
    ok: true,
    userId: uid,
    profileId: definition.id,
    createdCore,
    createdApp,
    atomicity: 'cross-database-two-phase',
  }
}

export function createProfileProvisionHandler(
  definition: ProfileProvisionDefinition
) {
  return defineEventHandler(async (event) => {
    const { uid } = await requireFirebaseBearerUser(event)
    return provisionRuntimeProfile(uid, definition)
  })
}
