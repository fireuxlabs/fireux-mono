import {
  createDefaultKitchenStation,
  kitchenStationsTarget,
} from '../../stations/default'
import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import { USER_MUTATION_TARGETS } from 'fireux-core/runtime/user/server/mutation-targets'
import { PLACE_MUTATION_TARGETS } from 'fireux-places/runtime/place/server/mutation-targets'
import { KITCHEN_MUTATION_TARGETS, serverKitchenMenusTarget, serverKitchenTeamMembersTarget } from '../../mutation-targets'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import type { KitchenOnboardingCompleteResult } from '../../../models/kitchen-onboarding.model.ts'
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
} from './onboarding-actor'
import { resolveKitchenOnboardingTransactionLocator } from './locator'
import { buildKitchenTeamMemberRecord } from '../../team/member-record.ts'
import {
  serverKitchenAccessTarget,
  resolveKitchenGrantIds,
} from '../../core/access'
import {
  readKitchenAccessIds,
  withKitchenAppAccess,
} from '../../../utils/kitchen-access'
import { createMembershipAccess } from 'fireux-core/runtime/app/utils/membership-access'
import {
  readKitchenManagementMenus,
  createKitchenSystemMenus,
} from './system-menus.ts'
import { fail, readKitchenOnboardingRequest as request } from './request.ts'

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
  const accessTarget = serverKitchenAccessTarget()
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
      access,
      pass,
    ] = await Promise.all([
      mutations.read(memberships, ownerUserId),
      mutations.read(USER_MUTATION_TARGETS.runtimeUsers, ownerUserId),
      mutations.read(PLACE_MUTATION_TARGETS.places, locator.placeId),
      mutations.read(KITCHEN_MUTATION_TARGETS.kitchens, locator.kitchenId),
      mutations.read(teamMembers, ownerUserId),
      ownerUserId === current.uid
        ? Promise.resolve(null)
        : mutations.read(memberships, current.uid),
      readKitchenManagementMenus(mutations, menus),
      mutations.read(accessTarget, ownerUserId),
      mutations.read(kitchenStationsTarget(locator.kitchenId), 'pass'),
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
    const kitchenIds = readKitchenAccessIds(
      access.data,
      membership.data,
      current.appId
    )
    const kitchenAccess = withKitchenAppAccess(
      access.data,
      current.appId,
      createMembershipAccess(
        resolveKitchenGrantIds(membership.data, kitchenIds, locator.kitchenId),
        membership.data
      )
    )
    const decision = kitchenOnboardingAccessDecision({
      kitchen: rootData,
      teamMember: teamMember.exists ? teamMember.data || {} : null,
      uid: ownerUserId,
      role: ownerUserId === current.uid ? role : actorRole,
      canCreate: current.canCreate,
      kitchenId: locator.kitchenId,
      membership: membership.data,
      kitchenIds,
    })
    if (!decision.can_complete || decision.action === 'request_access') {
      fail(403, decision.message || 'Kitchen access is required.')
    }

    const createdRoot = !root.exists
    const createdTeamMember = !teamMember.exists
    const placeName = text(place.data?.name)
    const slug =
      text((rootData?.identity as Record<string, unknown> | undefined)?.slug) ||
      normalizeSlug(placeName || locator.kitchenId)
    const ownerName = text(user.data?.display_name)
    if (createdTeamMember && !ownerName) {
      fail(409, 'The Kitchen owner must finish their User name first.')
    }

    if (createdRoot) {
      const stamp = serverAuditStamp({ by: current.uid, appId: current.appId })
      mutations.create(KITCHEN_MUTATION_TARGETS.kitchens, locator.kitchenId, {
        identity: { source: 'place', slug, status: 'active', visibility: true },
        created: stamp,
      })
    }

    const defaultsStamp = serverAuditStamp({
      by: current.uid,
      appId: current.appId,
    })
    if (createdRoot)
      createKitchenSystemMenus({
        mutations,
        target: menus,
        menus: systemMenus,
        kitchenId: locator.kitchenId,
        created: defaultsStamp,
      })
    if (!pass.exists)
      createDefaultKitchenStation(mutations, locator.kitchenId, defaultsStamp)

    if (createdTeamMember) {
      mutations.create(
        teamMembers,
        ownerUserId,
        buildKitchenTeamMemberRecord({
          name: ownerName,
          userId: ownerUserId,
        })
      )
    }

    if (access.exists) {
      mutations.update<Record<string, unknown>>(
        accessTarget,
        ownerUserId,
        kitchenAccess
      )
    } else {
      mutations.create(accessTarget, ownerUserId, kitchenAccess)
    }

    return {
      ok: true,
      kitchen_id: locator.kitchenId,
      place_id: locator.placeId,
      action: decision.action,
      created_root: createdRoot,
      created_team_member: createdTeamMember,
      owner_user_id: ownerUserId,
      ...(slug ? { slug } : {}),
    }
  })
}
