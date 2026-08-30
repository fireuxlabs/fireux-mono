// Concurrent edit — 2026-07-21 17:30 CEST — Kitchen onboarding: atomically bind Place, Kitchen root, and App access.
// Concurrent edit — 2026-07-28 18:10 CEST — Pre-release Kitchen spine: require exact root scope and access-only App support.
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/utils/app-user-access'
import { initialMembership } from 'fireux-core/runtime/app/server/membership/mutation-contract'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { resolveWorkspaceEntityCreationId } from 'fireux-core/runtime/server/utils/workspace-entity/creation-identity'
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
  resolveKitchenOnboardingBeneficiaryUserId,
  type KitchenOnboardingFirestore as Firestore,
} from './onboarding-actor'
import { buildKitchenTeamMemberRecord } from '../../team/member-record.ts'
import { readAppUserKitchenIds } from '../../core/user-kitchens.ts'

type Locator = {
  placeId: string
  kitchenId: string
  kitchen: Record<string, unknown> | null
}

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

async function assertKitchenCreationAllowance(
  membership: Record<string, unknown> | undefined
) {
  const access = resolveAppUserAccess(membership)
  if (access.hasBusinessSubscription) return
  const kitchenIds = readAppUserKitchenIds(membership)
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
      resolveWorkspaceEntityCreationId({
        intent: 'use_source',
        sourceId: requestedKitchenId,
      }),
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

  const placeId = requireFirestoreDocumentId(
    resolveWorkspaceEntityCreationId({
      intent: 'use_source',
      sourceId: text(value.place_id),
    }),
    'Place id'
  )
  return kitchenForPlace(db, placeId)
}

export async function previewKitchenOnboarding(
  event: H3Event,
  input: unknown
): Promise<KitchenOnboardingPreview> {
  const body = request(input, ['place_id', 'kitchen_id', 'owner_user_id'])
  const current = await actor(event)
  const ownerUserId = resolveKitchenOnboardingBeneficiaryUserId(
    current,
    body.owner_user_id
  )
  const locator = await resolveLocator(current.db, body)
  const [place, ownerMembership, teamMember] = await Promise.all([
    current.db.collection('places').doc(locator.placeId).get(),
    current.db.doc(`apps/${current.appId}/users/${ownerUserId}`).get(),
    current.db.doc(`kitchens/${locator.kitchenId}/team/${ownerUserId}`).get(),
  ])
  const ownerRole = requireOnboardingMemberRole(
    ownerMembership.exists,
    ownerMembership.get('role')
  )
  if (!place.exists) fail(409, 'The linked Place does not exist.')
  assertKitchenOnboardingPlaceDefaults(place.data() || {})
  if (!locator.kitchen && teamMember.exists) {
    fail(409, 'Kitchen Team membership exists without its Kitchen.')
  }

  const decision = kitchenOnboardingAccessDecision({
    kitchen: locator.kitchen,
    teamMember: teamMember.exists ? teamMember.data() || {} : null,
    uid: ownerUserId,
    role: ownerUserId === current.uid ? ownerRole : current.role,
    canCreate: current.canCreate,
  })
  const slug = text(locator.kitchen?.slug)
  const displayName = text(place.data()?.name)
  const published = locator.kitchen?.visibility === true
  return {
    kitchen_id: locator.kitchenId,
    place_id: locator.placeId,
    ...(ownerUserId !== current.uid ? { owner_user_id: ownerUserId } : {}),
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
  const body = request(input, ['place_id', 'kitchen_id', 'owner_user_id'])
  const current = await actor(event)
  const ownerUserId = resolveKitchenOnboardingBeneficiaryUserId(
    current,
    body.owner_user_id
  )
  const locator = await resolveLocator(current.db, body)
  const memberships = serverAppUsersTarget(current.appId)
  const teamMembers = serverKitchenTeamMembersTarget(locator.kitchenId)

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [membership, user, place, root, teamMember] = await Promise.all([
      mutations.read(memberships, ownerUserId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.runtimeUsers, ownerUserId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.places, locator.placeId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, locator.kitchenId),
      mutations.read(teamMembers, ownerUserId),
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
      await assertKitchenCreationAllowance(membership.data)
    }
    const decision = kitchenOnboardingAccessDecision({
      kitchen: rootData,
      teamMember: teamMember.exists ? teamMember.data || {} : null,
      uid: ownerUserId,
      role: ownerUserId === current.uid ? role : current.role,
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
    const ownerName = text(user.data?.display_name)
    if (createdTeamMember && !ownerName) {
      fail(409, 'The Kitchen owner must finish their User name first.')
    }

    if (createdRoot) {
      const stamp = serverAuditStamp({ by: current.uid, appId: current.appId })
      mutations.create(FIRESTORE_MUTATION_TARGETS.kitchens, locator.kitchenId, {
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
        ownerUserId,
        buildKitchenTeamMemberRecord({
          appId: current.appId,
          createdBy: current.uid,
          kitchenId: locator.kitchenId,
          memberId: ownerUserId,
          name: ownerName,
          role: createdRoot ? 'owner' : 'operator',
          slug: normalizeSlug(ownerName) || 'team-member',
          userId: ownerUserId,
        })
      )
    }

    const kitchens = [
      ...new Set([
        ...readAppUserKitchenIds(membership.data),
        locator.kitchenId,
      ]),
    ]
    const workspaceState = {
      kitchens,
      primary_kitchen: locator.kitchenId,
    }
    if (membership.exists) {
      mutations.update(memberships, ownerUserId, workspaceState)
    } else {
      mutations.create(memberships, ownerUserId, {
        ...initialMembership(ownerUserId, 'user'),
        ...workspaceState,
      })
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
  const body = request(input, ['intent', 'name', 'owner_user_id'])
  if (body.intent !== 'create_shell') {
    fail(400, 'Explicit Kitchen shell creation intent is required.')
  }
  const name = text(body.name)
  if (!name || name.length > 120) {
    fail(400, 'Kitchen name is required and must be 120 characters or fewer.')
  }

  const current = await actor(event)
  if (!current.canCreate) {
    fail(403, 'Kitchen creation is disabled for this App.')
  }
  const ownerUserId = resolveKitchenOnboardingBeneficiaryUserId(
    current,
    body.owner_user_id
  )
  const kitchenId = requireFirestoreDocumentId(
    resolveWorkspaceEntityCreationId({ intent: 'create_shell', ownerUserId }),
    'Kitchen id'
  )
  const memberships = serverAppUsersTarget(current.appId)
  const teamMembers = serverKitchenTeamMembersTarget(kitchenId)

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [membership, user, place, root, teamMember] = await Promise.all([
      mutations.read(memberships, ownerUserId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.runtimeUsers, ownerUserId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.places, kitchenId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId),
      mutations.read(teamMembers, ownerUserId),
    ])
    const ownerName = text(user.data?.display_name)
    if (!ownerName) {
      fail(409, 'The Kitchen owner must finish their User name first.')
    }

    const anyShellRecord = place.exists || root.exists || teamMember.exists
    if (anyShellRecord) {
      if (
        !place.exists ||
        !root.exists ||
        !teamMember.exists ||
        text(teamMember.data?.user_id) !== ownerUserId ||
        teamMember.data?.status !== 'active'
      ) {
        fail(409, 'Kitchen shell identity is incomplete.')
      }
      mutations.update(FIRESTORE_MUTATION_TARGETS.places, kitchenId, { name })
    } else {
      await assertKitchenCreationAllowance(membership.data)
      const slug = normalizeSlug(name) || kitchenId.toLowerCase()
      const created = serverAuditStamp({
        by: current.uid,
        appId: current.appId,
      })
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
        slug,
        status: 'active',
        visibility: false,
        created,
        updated: serverAuditStamp({ by: current.uid }),
      })
      mutations.create(
        teamMembers,
        ownerUserId,
        buildKitchenTeamMemberRecord({
          appId: current.appId,
          createdBy: current.uid,
          kitchenId,
          memberId: ownerUserId,
          name: ownerName,
          role: 'owner',
          slug: normalizeSlug(ownerName) || 'team-member',
          userId: ownerUserId,
        })
      )
    }

    const kitchens = [
      ...new Set([...readAppUserKitchenIds(membership.data), kitchenId]),
    ]
    const workspaceState = { kitchens, primary_kitchen: kitchenId }
    if (membership.exists) {
      mutations.update(memberships, ownerUserId, workspaceState)
    } else {
      mutations.create(memberships, ownerUserId, {
        ...initialMembership(ownerUserId, 'user'),
        ...workspaceState,
      })
    }

    const slug = text(root.data?.slug) || normalizeSlug(name)
    return {
      ok: true as const,
      kitchen_id: kitchenId,
      place_id: kitchenId,
      action: anyShellRecord ? ('open' as const) : ('create' as const),
      created_root: !anyShellRecord,
      created_team_member: !anyShellRecord,
      ...(slug ? { slug } : {}),
    }
  })
}

export { adoptAnonymousKitchen } from './adoption'
