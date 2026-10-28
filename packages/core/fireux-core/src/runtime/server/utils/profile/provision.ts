import { useRuntimeConfig } from '#imports'
import { defineEventHandler } from 'h3'
import type { ProfileProvisionResult } from '../../../models/operations/profile-provisioning'
import { USER_MUTATION_TARGETS, serverUserProfileAppStateTarget, serverUserProfileTarget } from '../../../user/server/mutation-targets'
import { serverAppUsersTarget } from '../../../app/server/mutation-targets'
import { requireFirebaseBearerUser } from '../auth/bearer'
import { runGuardedServerTransaction } from '../firestore-mutations/server-transaction'
import {
  assertProfileProvisionDefinition as assertDefinition,
  assertProfileProvisionSeed as assertSeed,
  buildProfileAppStateProvisionData as appStateData,
  buildProfileProvisionData as profileData,
  failProfileProvision as fail,
  requireProfileProvisionAppMembership as requireAppMembership,
  requireProfileProvisionCanonicalUser as requireCanonicalUser,
  requireProfileProvisionSegment as configuredSegment,
  type ProfileProvisionContractDefinition as ProfileProvisionDefinition,
  type ProfileProvisionContractSeed as ProfileProvisionSeed,
  type ProfileProvisionTransactionOutcome as ProfileTransactionOutcome,
} from './profile-provision-contract'

export type {
  ProfileProvisionContractDefinition as ProfileProvisionDefinition,
  ProfileProvisionContractSeed as ProfileProvisionSeed,
} from './profile-provision-contract'

function isRuntimeProfileEnabled(
  configuredProfiles: unknown,
  profileId: string
): boolean {
  return (
    Array.isArray(configuredProfiles) &&
    configuredProfiles.some((configured) => configured === profileId)
  )
}

function runtimeDatabaseContext(definition: ProfileProvisionDefinition) {
  const runtime = useRuntimeConfig()
  const fireux = runtime.public?.fireux as Record<string, unknown> | undefined
  const firebase = runtime.public?.firebaseEcosystem?.firebase as
    | Record<string, unknown>
    | undefined
  const appId = configuredSegment(fireux?.id, 'Runtime App id')

  if (!isRuntimeProfileEnabled(fireux?.profiles, definition.kind)) {
    fail(404, `${definition.label} profiles are not enabled for this App.`)
  }

  const runtimeDatabaseId = String(firebase?.databaseId ?? '').trim()
  const identityDatabaseId =
    String(firebase?.identityDatabaseId ?? '').trim() || runtimeDatabaseId
  const canonical = (value: string) => (value === '(default)' ? '' : value)
  return {
    appId,
    sameDatabase:
      canonical(runtimeDatabaseId) === canonical(identityDatabaseId),
  }
}

async function requireRuntimeMembership(uid: string, appId: string) {
  const memberships = serverAppUsersTarget(appId)
  await runGuardedServerTransaction(
    memberships.database,
    async (mutations) => {
      const membership = await mutations.read(memberships, uid)
      requireAppMembership(membership)
    }
  )
}

async function provisionUserProfile(
  definition: ProfileProvisionDefinition,
  uid: string,
  appId: string,
  profileSeed: ProfileProvisionSeed,
  appStateSeed: ProfileProvisionSeed | null,
  placement: 'runtime' | 'identity',
  includeMembership: boolean
): Promise<ProfileTransactionOutcome> {
  const users =
    placement === 'runtime'
      ? USER_MUTATION_TARGETS.runtimeUsers
      : USER_MUTATION_TARGETS.users
  const memberships = includeMembership ? serverAppUsersTarget(appId) : null
  const profiles = serverUserProfileTarget(uid, definition.kind, placement)
  const appStates = definition.appState
    ? serverUserProfileAppStateTarget(
        uid,
        definition.kind,
        appId,
        placement
      )
    : null

  return runGuardedServerTransaction(users.database, async (mutations) => {
    const [user, membership, profile, appState] = await Promise.all([
      mutations.read(users, uid),
      memberships
        ? mutations.read(memberships, uid)
        : Promise.resolve(null),
      mutations.read(profiles, definition.kind),
      appStates
        ? mutations.read(appStates, appId)
        : Promise.resolve(null),
    ])
    requireCanonicalUser(user)
    if (membership) requireAppMembership(membership)

    const createdProfile = !profile.exists
    const createdAppState = Boolean(appStates && appState && !appState.exists)
    if (createdProfile) {
      mutations.create(
        profiles,
        definition.kind,
        profileData(profileSeed, uid, definition.kind)
      )
    }
    if (appStates && appState && !appState.exists && appStateSeed) {
      mutations.create(
        appStates,
        appId,
        appStateData(appStateSeed, uid, appId, definition.kind)
      )
    }
    return { createdProfile, createdAppState }
  })
}

export async function provisionRuntimeProfile(
  actorUid: string,
  definition: ProfileProvisionDefinition
): Promise<ProfileProvisionResult> {
  assertDefinition(definition)
  const uid = configuredSegment(actorUid, 'Authenticated User id')
  const context = runtimeDatabaseContext(definition)
  const profileSeed = assertSeed(
    definition.profile.seed(),
    `${definition.label} profile seed`
  )
  const appStateSeed = definition.appState
    ? assertSeed(
        definition.appState.seed(),
        `${definition.label} App-state seed`
      )
    : null

  const outcome = context.sameDatabase
    ? await provisionUserProfile(
        definition,
        uid,
        context.appId,
        profileSeed,
        appStateSeed,
        'runtime',
        true
      )
    : await (async () => {
        await requireRuntimeMembership(uid, context.appId)
        return provisionUserProfile(
          definition,
          uid,
          context.appId,
          profileSeed,
          appStateSeed,
          'identity',
          false
        )
      })()

  return {
    ok: true,
    userId: uid,
    profileKind: definition.kind,
    ...outcome,
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
