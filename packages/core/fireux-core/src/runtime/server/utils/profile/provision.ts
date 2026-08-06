import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler } from 'h3'
import type { ProfileProvisionResult } from '../../../models/operations/profile-provisioning'
import { isRuntimeProfileEnabled } from '../../../utils/profile-index'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppProfileTarget,
  serverAppUsersTarget,
  serverRootProfileTarget,
} from '../../../utils/firestore-mutations/targets'
import { requireFirebaseBearerUser } from '../auth/bearer'
import { runGuardedServerTransaction } from '../firestore-mutations/server-transaction'
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

type RootProfileId = 'agent' | 'chef' | 'driver' | 'professional'
type AppProfileId = RootProfileId | 'customer'

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
  const identityDatabaseId =
    String(firebase?.identityDatabaseId ?? '').trim() || appDatabaseId
  const canonical = (value: string) => (value === '(default)' ? '' : value)
  return {
    appId,
    sameDatabase: canonical(appDatabaseId) === canonical(identityDatabaseId),
  }
}

function ids(definition: ProfileProvisionDefinition) {
  return {
    app: definition.id as AppProfileId,
    root: definition.root ? (definition.id as RootProfileId) : null,
  }
}

async function provisionSingleDatabase(
  definition: ProfileProvisionDefinition,
  uid: string,
  appId: string,
  rootSeed: ProfileProvisionSeed | null,
  appSeed: ProfileProvisionSeed
): Promise<ProfileTransactionOutcome> {
  const profileIds = ids(definition)
  const users = FIRESTORE_MUTATION_TARGETS.runtimeUsers
  const memberships = serverAppUsersTarget(appId)
  const appProfiles = serverAppProfileTarget(appId, profileIds.app)
  const rootProfiles = profileIds.root
    ? serverRootProfileTarget(profileIds.root, 'runtime')
    : null

  return runGuardedServerTransaction(users.database, async (mutations) => {
    const [user, membership, root, app] = await Promise.all([
      mutations.read(users, uid),
      mutations.read(memberships, uid),
      rootProfiles ? mutations.read(rootProfiles, uid) : Promise.resolve(null),
      mutations.read(appProfiles, uid),
    ])
    requireCanonicalUser(user)
    requireAppMembership(membership)
    const createdCore = Boolean(rootProfiles && root && !root.exists)
    const createdApp = !app.exists
    if (rootProfiles && root && !root.exists) {
      mutations.create(rootProfiles, uid, rootProfileData(rootSeed ?? {}, uid))
    }
    if (createdApp) {
      mutations.create(appProfiles, uid, appProfileData(appSeed, uid, appId))
    }
    return { createdCore, createdApp }
  })
}

async function provisionIdentityPhase(
  profileId: RootProfileId,
  uid: string,
  rootSeed: ProfileProvisionSeed
) {
  const users = FIRESTORE_MUTATION_TARGETS.users
  const roots = serverRootProfileTarget(profileId, 'identity')
  return runGuardedServerTransaction(users.database, async (mutations) => {
    const [user, root] = await Promise.all([
      mutations.read(users, uid),
      mutations.read(roots, uid),
    ])
    requireCanonicalUser(user)
    if (!root.exists)
      mutations.create(roots, uid, rootProfileData(rootSeed, uid))
    return !root.exists
  })
}

async function provisionAppPhase(
  profileId: AppProfileId,
  uid: string,
  appId: string,
  appSeed: ProfileProvisionSeed
) {
  const memberships = serverAppUsersTarget(appId)
  const profiles = serverAppProfileTarget(appId, profileId)
  return runGuardedServerTransaction(
    memberships.database,
    async (mutations) => {
      const [membership, profile] = await Promise.all([
        mutations.read(memberships, uid),
        mutations.read(profiles, uid),
      ])
      requireAppMembership(membership)
      if (!profile.exists) {
        mutations.create(profiles, uid, appProfileData(appSeed, uid, appId))
      }
      return !profile.exists
    }
  )
}

export async function provisionRuntimeProfile(
  actorUid: string,
  definition: ProfileProvisionDefinition
): Promise<ProfileProvisionResult> {
  assertDefinition(definition)
  const uid = configuredSegment(actorUid, 'Authenticated User id')
  const context = runtimeDatabaseContext(definition)
  const profileIds = ids(definition)
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

  let createdCore = false
  if (profileIds.root && rootSeed) {
    createdCore = await provisionIdentityPhase(profileIds.root, uid, rootSeed)
  }

  let createdApp: boolean
  try {
    createdApp = await provisionAppPhase(
      profileIds.app,
      uid,
      context.appId,
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
