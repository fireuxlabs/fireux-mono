// Concurrent edit — 2026-07-21 17:30 CEST — Kitchen onboarding: atomically bind Place, Kitchen root, and App access.
// Concurrent edit — 2026-07-28 18:10 CEST — Pre-release Kitchen spine: require exact root scope and access-only App support.
import { createError, type H3Event } from 'h3'
import {
  runGuardedServerTransaction,
  type GuardedServerTransaction,
} from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/utils/app-user-access'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
  serverKitchenTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type {
  KitchenOnboardingCompleteResult,
  KitchenOnboardingPreview,
} from '../../../models/kitchen-onboarding.model.ts'
import {
  assertKitchenOnboardingPlaceDefaults,
  kitchenOnboardingAccessDecision,
  onboardingText as text,
  requireOnboardingMemberRole,
} from './onboarding-policy'
import {
  readKitchenOnboardingActor as actor,
  type KitchenOnboardingFirestore as Firestore,
} from './onboarding-actor'
import { buildKitchenTeamMemberRecord } from '../../team/member-record.ts'
import {
  readOwnedKitchenIdsInTransaction,
  readUserKitchenIds,
} from '../../core/user-kitchens.ts'

type Locator = {
  placeId: string
  kitchenId: string
  kitchen: Record<string, unknown> | null
}

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

async function assertKitchenCreationAllowance(
  transaction: GuardedServerTransaction,
  uid: string,
  membership: Record<string, unknown> | undefined
) {
  const access = resolveAppUserAccess(membership)
  if (access.hasBusinessSubscription) return
  const kitchenIds = await readOwnedKitchenIdsInTransaction(transaction, uid)
  if (kitchenIds.length) {
    fail(403, 'Your current subscription supports one Kitchen.')
  }
}

function request(value: unknown, allowed: readonly string[]) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'Kitchen onboarding request must be an object.')
  }
  const source = value as Record<string, unknown>
  const supported = new Set(allowed)
  const unsupported = Object.keys(source).find((key) => !supported.has(key))
  if (unsupported) {
    fail(400, `Kitchen onboarding contains unsupported field: ${unsupported}.`)
  }
  return source
}

async function kitchenForPlace(
  db: Firestore,
  placeId: string
): Promise<Locator> {
  const collection = db.collection('kitchens')
  const exact = await collection.doc(placeId).get()
  const exactData = exact.exists ? exact.data() || {} : null
  if (exactData) {
    return { placeId, kitchenId: exact.id, kitchen: exactData }
  }
  return { placeId, kitchenId: placeId, kitchen: null }
}

async function resolveLocator(
  db: Firestore,
  value: Record<string, unknown>
): Promise<Locator> {
  const requestedKitchenId = text(value.kitchen_id)
  if (requestedKitchenId) {
    const kitchenId = requireFirestoreDocumentId(
      requestedKitchenId,
      'Kitchen id'
    )
    const snapshot = await db.collection('kitchens').doc(kitchenId).get()
    if (!snapshot.exists) fail(404, 'Kitchen not found.')
    const kitchen = snapshot.data() || {}
    const placeId = kitchenId
    const requestedPlaceId = text(value.place_id)
    if (requestedPlaceId && requestedPlaceId !== placeId) {
      fail(409, 'Kitchen and Place do not match.')
    }
    return { placeId, kitchenId, kitchen }
  }

  const placeId = requireFirestoreDocumentId(value.place_id, 'Place id')
  return kitchenForPlace(db, placeId)
}

export async function previewKitchenOnboarding(
  event: H3Event,
  input: unknown
): Promise<KitchenOnboardingPreview> {
  const body = request(input, ['place_id', 'kitchen_id'])
  const current = await actor(event)
  const locator = await resolveLocator(current.db, body)
  const [place, teamMember] = await Promise.all([
    current.db.collection('places').doc(locator.placeId).get(),
    current.db.doc(`kitchens/${locator.kitchenId}/team/${current.uid}`).get(),
  ])
  if (!place.exists) fail(409, 'The linked Place does not exist.')
  assertKitchenOnboardingPlaceDefaults(place.data() || {})
  if (!locator.kitchen && teamMember.exists) {
    fail(409, 'Kitchen Team membership exists without its Kitchen.')
  }

  const decision = kitchenOnboardingAccessDecision({
    kitchen: locator.kitchen,
    teamMember: teamMember.exists ? teamMember.data() || {} : null,
    uid: current.uid,
    role: current.role,
    canCreate: current.canCreate,
  })
  const slug = text(locator.kitchen?.slug)
  const displayName = text(place.data()?.name)
  const published = locator.kitchen?.visibility === true
  return {
    kitchen_id: locator.kitchenId,
    place_id: locator.placeId,
    existing: Boolean(locator.kitchen),
    connected: teamMember.exists,
    ...decision,
    ...(displayName ? { display_name: displayName } : {}),
    ...(locator.kitchen ? { published } : {}),
    ...(slug ? { slug } : {}),
  }
}

export async function completeKitchenOnboarding(
  event: H3Event,
  input: unknown
): Promise<KitchenOnboardingCompleteResult> {
  const body = request(input, ['place_id', 'kitchen_id'])
  const current = await actor(event)
  const locator = await resolveLocator(current.db, body)
  const memberships = serverAppUsersTarget(current.appId)
  const teamMembers = serverKitchenTeamMembersTarget(locator.kitchenId)

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [membership, user, place, root, teamMember] = await Promise.all([
      mutations.read(memberships, current.uid),
      mutations.read(FIRESTORE_MUTATION_TARGETS.runtimeUsers, current.uid),
      mutations.read(FIRESTORE_MUTATION_TARGETS.places, locator.placeId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, locator.kitchenId),
      mutations.read(teamMembers, current.uid),
    ])
    const role = requireOnboardingMemberRole(
      membership.exists,
      membership.data?.role
    )
    if (!place.exists) fail(409, 'The linked Place no longer exists.')
    assertKitchenOnboardingPlaceDefaults(place.data || {})

    const rootData = root.exists ? root.data || {} : null
    if (!rootData && !current.canCreate) {
      fail(403, 'Kitchen creation is disabled for this App.')
    }

    if (!rootData && teamMember.exists) {
      fail(409, 'Kitchen Team membership exists without its Kitchen.')
    }
    if (!rootData) {
      await assertKitchenCreationAllowance(
        mutations,
        current.uid,
        membership.data
      )
    }
    const decision = kitchenOnboardingAccessDecision({
      kitchen: rootData,
      teamMember: teamMember.exists ? teamMember.data || {} : null,
      uid: current.uid,
      role,
      canCreate: current.canCreate,
    })
    if (!decision.can_complete || decision.action === 'request_access') {
      fail(403, decision.message || 'Kitchen access is required.')
    }

    const createdRoot = !root.exists
    const createdTeamMember = !teamMember.exists
    const placeName = text(place.data?.name)
    const slug =
      text(rootData?.slug) || normalizeSlug(placeName || locator.kitchenId)
    const creatorName = text(user.data?.display_name) || current.authDisplayName
    if (createdRoot && !creatorName) {
      fail(409, 'Finish your User name before creating a Kitchen.')
    }

    if (createdRoot) {
      const stamp = serverAuditStamp({ by: current.uid, appId: current.appId })
      mutations.create(FIRESTORE_MUTATION_TARGETS.kitchens, locator.kitchenId, {
        name: placeName,
        slug,
        status: 'active',
        visibility: false,
        created: stamp,
        updated: serverAuditStamp({ by: current.uid }),
      })
    }

    if (createdTeamMember) {
      mutations.create(
        teamMembers,
        current.uid,
        buildKitchenTeamMemberRecord({
          appId: current.appId,
          createdBy: current.uid,
          kitchenId: locator.kitchenId,
          memberId: current.uid,
          name: creatorName,
          role: createdRoot ? 'owner' : 'operator',
          slug: normalizeSlug(creatorName) || 'team-member',
          userId: current.uid,
        })
      )
    }

    return {
      ok: true,
      kitchen_id: locator.kitchenId,
      place_id: locator.placeId,
      action: decision.action,
      created_root: createdRoot,
      created_team_member: createdTeamMember,
      ...(slug ? { slug } : {}),
    }
  })
}

export async function createKitchenShell(event: H3Event, input: unknown) {
  const body = request(input, ['name', 'kitchen_id'])
  const name = text(body.name)
  if (!name || name.length > 120) {
    fail(400, 'Kitchen name is required and must be 120 characters or fewer.')
  }

  const current = await actor(event, {
    allowAnonymous: true,
    allowMissingMembership: true,
  })
  if (!current.canCreate)
    fail(403, 'Kitchen creation is disabled for this App.')
  const requestedKitchenId = text(body.kitchen_id)
  const existingKitchenIds = await readUserKitchenIds(current.uid)
  const requestedRoot = requestedKitchenId
    ? await current.db.collection('kitchens').doc(requestedKitchenId).get()
    : null
  const kitchenId = requestedKitchenId
    ? requireFirestoreDocumentId(requestedKitchenId, 'Kitchen id')
    : existingKitchenIds.length
      ? current.db.collection('kitchens').doc().id
      : current.uid
  const teamMembers = serverKitchenTeamMembersTarget(kitchenId)
  const memberships = serverAppUsersTarget(current.appId)
  const creatorName =
    current.authDisplayName || `Guest ${current.uid.slice(0, 6)}`

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [membership, place, root, teamMember] = await Promise.all([
      mutations.read(memberships, current.uid),
      mutations.read(FIRESTORE_MUTATION_TARGETS.places, kitchenId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId),
      mutations.read(teamMembers, current.uid),
    ])
    if (root.exists || place.exists || teamMember.exists) {
      if (
        !root.exists ||
        !place.exists ||
        !teamMember.exists ||
        text(teamMember.data?.user_id) !== current.uid ||
        teamMember.data?.status !== 'active'
      ) {
        fail(409, 'Kitchen shell identity is incomplete.')
      }
      mutations.update(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId, {
        name,
      })
      mutations.update(FIRESTORE_MUTATION_TARGETS.places, kitchenId, {
        name,
      })
      return {
        ok: true as const,
        kitchen_id: kitchenId,
        action: 'update' as const,
        created_root: false,
        created_team_member: false,
        slug: text(root.data?.slug),
      }
    }

    await assertKitchenCreationAllowance(
      mutations,
      current.uid,
      membership.data
    )

    const slug = normalizeSlug(name) || kitchenId.toLowerCase()
    const created = serverAuditStamp({ by: current.uid, appId: current.appId })
    mutations.create(FIRESTORE_MUTATION_TARGETS.places, kitchenId, {
      name,
      slug,
      place_type: 'non_physical',
      source: 'manual',
      entity_families: ['kitchen'],
      created,
      updated: serverAuditStamp({ by: current.uid }),
    })
    mutations.create(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId, {
      name,
      slug,
      status: 'active',
      visibility: false,
      created,
      updated: serverAuditStamp({ by: current.uid }),
    })
    mutations.create(
      teamMembers,
      current.uid,
      buildKitchenTeamMemberRecord({
        appId: current.appId,
        createdBy: current.uid,
        kitchenId,
        memberId: current.uid,
        name: creatorName,
        role: 'owner',
        slug: normalizeSlug(creatorName) || 'guest',
        userId: current.uid,
      })
    )

    return {
      ok: true as const,
      kitchen_id: kitchenId,
      action: 'create' as const,
      created_root: true,
      created_team_member: true,
      slug,
    }
  })
}

export { adoptAnonymousKitchen } from './adoption'
