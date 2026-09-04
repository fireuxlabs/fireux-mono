// Concurrent edit — 2026-07-21 17:30 CEST — Kitchen onboarding: atomically bind Place, Kitchen root, and App access.
// Concurrent edit — 2026-07-28 18:10 CEST — Pre-release Kitchen spine: require exact root scope and access-only App support.
import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { initialMembership } from 'fireux-core/runtime/app/server/app-users/mutation-contract'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { resolveWorkspaceEntityCreationId } from 'fireux-core/runtime/server/utils/workspace-entity/creation-identity'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
  serverKitchenMenusTarget,
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
  assertKitchenOnboardingBeneficiaryAuthority,
  parseKitchenOnboardingBeneficiaryUserId,
  readKitchenOnboardingActor as actor,
  resolveKitchenOnboardingBeneficiaryUserId,
} from './onboarding-actor'
import {
  resolveKitchenOnboardingPreviewLocator,
  resolveKitchenOnboardingTransactionLocator,
} from './locator'
import { buildKitchenTeamMemberRecord } from '../../team/member-record.ts'
import { resolveAppUserKitchenState } from '../../core/user-kitchens.ts'
import { KitchenSystemMenuKinds } from '../../../../menu/utils/kitchen-system-menus.ts'
import { createKitchenSystemMenus } from './system-menus.ts'
import { fail, readKitchenOnboardingRequest as request } from './request.ts'

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
  const locator = await resolveKitchenOnboardingPreviewLocator(current.db, body)
  const [place, ownerMembership, teamMember] = await Promise.all([
    current.db.collection('places').doc(locator.placeId).get(),
    current.db.doc(`apps/${current.appId}/users/${ownerUserId}`).get(),
    current.db.doc(`kitchens/${locator.kitchenId}/team/${ownerUserId}`).get(),
  ])
  const ownerRole = requireOnboardingMemberRole(
    ownerMembership.exists,
    ownerMembership.get('role')
  )
  const actorRole = current.role
  if (!actorRole) fail(500, 'Kitchen onboarding actor role is unavailable.')
  if (!place.exists) fail(409, 'The linked Place does not exist.')
  assertKitchenOnboardingPlaceDefaults(place.data() || {})
  if (!locator.kitchen && teamMember.exists) {
    fail(409, 'Kitchen Team membership exists without its Kitchen.')
  }

  const decision = kitchenOnboardingAccessDecision({
    kitchen: locator.kitchen,
    teamMember: teamMember.exists ? teamMember.data() || {} : null,
    uid: ownerUserId,
    role: ownerUserId === current.uid ? ownerRole : actorRole,
    canCreate: current.canCreate,
  })
  const slug = text(locator.kitchen?.slug)
  const placeData = place.data() || {}
  const displayName = text(placeData.name)
  const published = locator.kitchen?.visibility === true
  return {
    kitchen_id: locator.kitchenId,
    place_id: locator.placeId,
    ...(ownerUserId !== current.uid ? { owner_user_id: ownerUserId } : {}),
    existing: Boolean(locator.kitchen),
    connected: teamMember.exists,
    ...decision,
    place: {
      id: locator.placeId,
      name: displayName,
      formatted_address: text(placeData.formatted_address),
      short_address: text(placeData.short_address),
      default_currency_code: text(placeData.default_currency_code),
      timezone: text(placeData.timezone),
    },
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
  const current = await actor(event, { deferMembership: true })
  const ownerUserId = parseKitchenOnboardingBeneficiaryUserId(
    current,
    body.owner_user_id
  )
  const locator = resolveKitchenOnboardingTransactionLocator(body)
  const memberships = serverAppUsersTarget(current.appId)
  const teamMembers = serverKitchenTeamMembersTarget(locator.kitchenId)
  const menus = serverKitchenMenusTarget(locator.kitchenId)

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [
      membership,
      user,
      place,
      root,
      teamMember,
      actorMembership,
      systemMenus,
    ] = await Promise.all([
      mutations.read(memberships, ownerUserId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.runtimeUsers, ownerUserId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.places, locator.placeId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, locator.kitchenId),
      mutations.read(teamMembers, ownerUserId),
      ownerUserId === current.uid
        ? Promise.resolve(null)
        : mutations.read(memberships, current.uid),
      mutations.readMany(menus, KitchenSystemMenuKinds),
    ])
    const role = requireOnboardingMemberRole(
      membership.exists,
      membership.data?.role
    )
    const actorRole = actorMembership
      ? requireOnboardingMemberRole(
          actorMembership.exists,
          actorMembership.data?.role
        )
      : role
    assertKitchenOnboardingBeneficiaryAuthority(current, ownerUserId, actorRole)
    if (!place.exists) fail(409, 'The linked Place no longer exists.')
    assertKitchenOnboardingPlaceDefaults(place.data || {})

    const rootData = root.exists ? root.data || {} : null
    if (locator.requireExistingKitchen && !rootData) {
      fail(404, 'Kitchen not found.')
    }
    if (!rootData && !current.canCreate) {
      fail(403, 'Kitchen creation is disabled for this App.')
    }

    if (!rootData && teamMember.exists) {
      fail(409, 'Kitchen Team membership exists without its Kitchen.')
    }
    const workspaceState = resolveAppUserKitchenState(
      membership.data,
      locator.kitchenId,
      current.subscriptionCapacity
    )
    const decision = kitchenOnboardingAccessDecision({
      kitchen: rootData,
      teamMember: teamMember.exists ? teamMember.data || {} : null,
      uid: ownerUserId,
      role: ownerUserId === current.uid ? role : actorRole,
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
        identity_source: 'place',
        slug,
        status: 'active',
        visibility: false,
        menus: { primary_menu_id: 'food' },
        created: stamp,
        updated: serverAuditStamp({ by: current.uid }),
      })
      createKitchenSystemMenus({
        mutations,
        target: menus,
        kitchenId: locator.kitchenId,
        menus: systemMenus,
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
      app_user: { id: ownerUserId, ...workspaceState },
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

  const current = await actor(event, { deferMembership: true })
  if (!current.canCreate) {
    fail(403, 'Kitchen creation is disabled for this App.')
  }
  const ownerUserId = parseKitchenOnboardingBeneficiaryUserId(
    current,
    body.owner_user_id
  )
  const kitchenId = requireFirestoreDocumentId(
    resolveWorkspaceEntityCreationId({ intent: 'create_shell', ownerUserId }),
    'Kitchen id'
  )
  const memberships = serverAppUsersTarget(current.appId)
  const teamMembers = serverKitchenTeamMembersTarget(kitchenId)
  const menus = serverKitchenMenusTarget(kitchenId)

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [
      membership,
      user,
      place,
      root,
      teamMember,
      actorMembership,
      systemMenus,
    ] = await Promise.all([
      mutations.read(memberships, ownerUserId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.runtimeUsers, ownerUserId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.places, kitchenId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId),
      mutations.read(teamMembers, ownerUserId),
      ownerUserId === current.uid
        ? Promise.resolve(null)
        : mutations.read(memberships, current.uid),
      mutations.readMany(menus, KitchenSystemMenuKinds),
    ])
    const ownerRole = requireOnboardingMemberRole(
      membership.exists,
      membership.data?.role
    )
    const actorRole = actorMembership
      ? requireOnboardingMemberRole(
          actorMembership.exists,
          actorMembership.data?.role
        )
      : ownerRole
    assertKitchenOnboardingBeneficiaryAuthority(current, ownerUserId, actorRole)
    const ownerName = text(user.data?.display_name)
    if (!ownerName) {
      fail(409, 'The Kitchen owner must finish their User name first.')
    }

    const anyShellRecord = place.exists || root.exists || teamMember.exists
    const workspaceState = resolveAppUserKitchenState(
      membership.data,
      kitchenId,
      current.subscriptionCapacity
    )
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
      const slug = normalizeSlug(name) || kitchenId.toLowerCase()
      const created = serverAuditStamp({
        by: current.uid,
        appId: current.appId,
      })
      mutations.create(FIRESTORE_MUTATION_TARGETS.places, kitchenId, {
        name,
        slug,
        place_type: 'non_physical',
        entity_families: ['kitchen'],
        created,
        updated: serverAuditStamp({ by: current.uid }),
      })
      mutations.create(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId, {
        identity_source: 'user',
        slug,
        status: 'active',
        visibility: false,
        menus: { primary_menu_id: 'food' },
        created,
        updated: serverAuditStamp({ by: current.uid }),
      })
      createKitchenSystemMenus({
        mutations,
        target: menus,
        kitchenId,
        menus: systemMenus,
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
      app_user: { id: ownerUserId, ...workspaceState },
      ...(slug ? { slug } : {}),
    }
  })
}

export { adoptAnonymousKitchen } from './adoption'
