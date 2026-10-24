import { createDefaultKitchenStation } from '../../stations/default'
import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { resolveWorkspaceEntityCreationId } from 'fireux-core/runtime/workspace/server/entity/creation-identity'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
  serverKitchenMenusTarget,
  serverKitchenTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  onboardingText as text,
  requireOnboardingMemberRole,
} from './onboarding-policy'
import {
  assertKitchenOnboardingBeneficiaryAuthority,
  parseKitchenOnboardingBeneficiaryUserId,
  readKitchenOnboardingActor as actor,
} from './onboarding-actor'
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
import { createKitchenSystemMenus } from './system-menus.ts'
import { fail, readKitchenOnboardingRequest as request } from './request.ts'

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
  const accessTarget = serverKitchenAccessTarget()
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
      access,
    ] = await Promise.all([
      mutations.read(memberships, ownerUserId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.runtimeUsers, ownerUserId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.places, kitchenId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId),
      mutations.read(teamMembers, ownerUserId),
      ownerUserId === current.uid
        ? Promise.resolve(null)
        : mutations.read(memberships, current.uid),
      mutations.readAll(menus, 1),
      mutations.read(accessTarget, ownerUserId),
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
    const kitchenIds = readKitchenAccessIds(
      access.data,
      membership.data,
      current.appId
    )
    const kitchenAccess = withKitchenAppAccess(
      access.data,
      current.appId,
      createMembershipAccess(
        resolveKitchenGrantIds(membership.data, kitchenIds, kitchenId),
        membership.data
      )
    )
    if (anyShellRecord) {
      if (
        !place.exists ||
        !root.exists ||
        !teamMember.exists ||
        text(teamMember.data?.user_id) !== ownerUserId
      ) {
        fail(409, 'Kitchen shell identity is incomplete.')
      }
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
      })
      mutations.create(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId, {
        identity: { source: 'user', slug, status: 'active', visibility: true },
        created,
      })
      createKitchenSystemMenus({
        mutations,
        target: menus,
        kitchenId,
        menus: systemMenus,
        created,
      })
      createDefaultKitchenStation(mutations, kitchenId, created)
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

    const slug =
      text(
        (root.data?.identity as Record<string, unknown> | undefined)?.slug
      ) || normalizeSlug(name)
    return {
      ok: true as const,
      kitchen_id: kitchenId,
      place_id: kitchenId,
      action: anyShellRecord ? ('open' as const) : ('create' as const),
      created_root: !anyShellRecord,
      created_team_member: !anyShellRecord,
      owner_user_id: ownerUserId,
      ...(slug ? { slug } : {}),
    }
  })
}
