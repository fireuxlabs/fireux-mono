// Concurrent edit — 2026-07-20 18:25 CEST — Repo Efficiency Pass 2 of 6: provision App-enabled profiles and ordered indexes through one trusted transaction seam.

import { useRuntimeConfig } from '#imports'
import {
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type Firestore,
} from 'firebase-admin/firestore'
import { createError, defineEventHandler } from 'h3'
import { AppStorage } from '../../../models/core/app.model'
import {
  canonicalProfileIndex,
  isRuntimeProfileEnabled,
  type ProfileProvisionResult,
} from '../../../models/core/supporting/profile-provisioning'
import { UserAppStorage, UserStorage } from '../../../models/core/user.model'
import { requireFirebaseBearerUser } from '../auth/bearer'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../getRuntimeFirestore'
import { serverAuditStamp } from '../records/stamps'

export type ProfileProvisionSeed = Readonly<Record<string, unknown>>

export type ProfileProvisionDefinition = {
  id: string
  label: string
  root?: {
    collection: string
    seed: () => ProfileProvisionSeed
  }
  app: {
    collection: string
    seed: () => ProfileProvisionSeed
  }
}

type ProfileTransactionOutcome = {
  createdCore: boolean
  createdApp: boolean
}

const ROOT_PROFILE_ORDER = ['agent', 'chef', 'driver', 'professional'] as const
const APP_PROFILE_ORDER = [
  'agent',
  'chef',
  'customer',
  'driver',
  'professional',
] as const
const ROOT_PROFILE_IDS: ReadonlySet<string> = new Set(ROOT_PROFILE_ORDER)
const APP_PROFILE_IDS: ReadonlySet<string> = new Set(APP_PROFILE_ORDER)
const RESERVED_SEED_KEYS = new Set([
  'id',
  'user',
  'created',
  'updated',
  'created_at',
  'updated_at',
])

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function configuredSegment(value: unknown, label: string) {
  const segment = String(value ?? '').trim()
  if (!segment || segment.includes('/')) {
    fail(500, `${label} is not configured correctly.`)
  }
  return segment
}

function assertDefinition(definition: ProfileProvisionDefinition) {
  const id = configuredSegment(definition.id, 'Profile id')
  configuredSegment(definition.label, 'Profile label')
  configuredSegment(definition.app.collection, 'App profile collection')

  if (!APP_PROFILE_IDS.has(id)) {
    fail(500, `The ${definition.label} App profile is not supported.`)
  }
  if (definition.root) {
    configuredSegment(definition.root.collection, 'Root profile collection')
    if (!ROOT_PROFILE_IDS.has(id)) {
      fail(500, `The ${definition.label} root profile is not supported.`)
    }
  }
}

function assertSeed(
  seed: ProfileProvisionSeed,
  label: string
): ProfileProvisionSeed {
  if (!seed || typeof seed !== 'object' || Array.isArray(seed)) {
    fail(500, `${label} did not return an object.`)
  }

  for (const key of Object.keys(seed)) {
    if (RESERVED_SEED_KEYS.has(key)) {
      fail(500, `${label} must not supply ${key}.`)
    }
  }

  return seed
}

function assertProfileList(
  value: unknown,
  order: readonly string[],
  label: string
): string[] {
  const allowed = new Set(order)
  if (
    !Array.isArray(value) ||
    value.length > 20 ||
    value.some((entry) => typeof entry !== 'string' || !allowed.has(entry)) ||
    new Set(value).size !== value.length
  ) {
    fail(409, `${label} has an invalid profile index.`)
  }
  const canonical = canonicalProfileIndex(value, order)
  if (canonical.some((profileId, index) => value[index] !== profileId)) {
    fail(409, `${label} profile index is not in canonical order.`)
  }
  return value
}

function requireCanonicalUser(snapshot: DocumentSnapshot) {
  if (!snapshot.exists) {
    fail(409, 'Create the canonical User before creating a profile.')
  }
  return assertProfileList(
    snapshot.data()?.profiles,
    ROOT_PROFILE_ORDER,
    'The canonical User'
  )
}

function requireAppMembership(snapshot: DocumentSnapshot) {
  if (!snapshot.exists) {
    fail(403, 'Join this App before creating an App profile.')
  }

  const data = snapshot.data() as DocumentData
  if (data.role !== 'user' && data.role !== 'admin') {
    fail(409, 'The App membership is invalid.')
  }

  return assertProfileList(
    data.profiles,
    APP_PROFILE_ORDER,
    'The App membership'
  )
}

function rootProfileData(seed: ProfileProvisionSeed, uid: string) {
  return {
    ...seed,
    created: serverAuditStamp({ by: uid }),
    updated: serverAuditStamp({ by: uid }),
  }
}

function appProfileData(
  seed: ProfileProvisionSeed,
  uid: string,
  appId: string
) {
  return {
    ...seed,
    created: serverAuditStamp({ by: uid, appId }),
    updated: serverAuditStamp({ by: uid }),
  }
}

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
    user: identityDb.collection(UserStorage.rootCollection).doc(uid),
    root: definition.root
      ? identityDb.collection(definition.root.collection).doc(uid)
      : null,
    membership: appDb
      .collection(AppStorage.collection)
      .doc(appId)
      .collection(UserAppStorage.collection)
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
    const userProfiles = requireCanonicalUser(userSnapshot)
    const appProfiles = requireAppMembership(membershipSnapshot)
    const createdCore = Boolean(
      refs.root && rootSnapshot && !rootSnapshot.exists
    )
    const createdApp = !appSnapshot.exists

    if (refs.root && rootSnapshot && !rootSnapshot.exists) {
      transaction.create(refs.root, rootProfileData(rootSeed ?? {}, uid))
    }
    if (definition.root && !userProfiles.includes(definition.id)) {
      transaction.update(refs.user, {
        profiles: canonicalProfileIndex(
          userProfiles,
          ROOT_PROFILE_ORDER,
          definition.id
        ),
        updated: serverAuditStamp({ by: uid }),
      })
    }
    if (!appSnapshot.exists) {
      transaction.create(refs.app, appProfileData(appSeed, uid, appId))
    }
    if (!appProfiles.includes(definition.id)) {
      transaction.update(refs.membership, {
        profiles: canonicalProfileIndex(
          appProfiles,
          APP_PROFILE_ORDER,
          definition.id
        ),
        updated: serverAuditStamp({ by: uid }),
      })
    }

    return { createdCore, createdApp }
  })
}

async function provisionIdentityPhase(
  definition: ProfileProvisionDefinition,
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
    const userProfiles = requireCanonicalUser(userSnapshot)
    const createdCore = !rootSnapshot.exists

    if (createdCore) {
      transaction.create(rootRef, rootProfileData(rootSeed, uid))
    }
    if (!userProfiles.includes(definition.id)) {
      transaction.update(userRef, {
        profiles: canonicalProfileIndex(
          userProfiles,
          ROOT_PROFILE_ORDER,
          definition.id
        ),
        updated: serverAuditStamp({ by: uid }),
      })
    }

    return createdCore
  })
}

async function provisionAppPhase(
  definition: ProfileProvisionDefinition,
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
    const appProfiles = requireAppMembership(membershipSnapshot)
    const createdApp = !appSnapshot.exists

    if (createdApp) {
      transaction.create(appRef, appProfileData(appSeed, uid, appId))
    }
    if (!appProfiles.includes(definition.id)) {
      transaction.update(membershipRef, {
        profiles: canonicalProfileIndex(
          appProfiles,
          APP_PROFILE_ORDER,
          definition.id
        ),
        updated: serverAuditStamp({ by: uid }),
      })
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
      definition,
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
      definition,
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
