import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { resolveWorkspaceEntityCreationId } from 'fireux-workspace/runtime/workspace/server/entity/creation-identity'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import { USER_MUTATION_TARGETS } from 'fireux-core/runtime/user/server/mutation-targets'
import { PLACE_MUTATION_TARGETS } from 'fireux-places/runtime/place/server/mutation-targets'
import { KITCHEN_MUTATION_TARGETS } from '../../mutation-targets'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/membership/mutation-targets'
import {
  onboardingText as text,
  requireOnboardingMemberRole,
} from './onboarding-policy'
import {
  assertKitchenOnboardingBeneficiaryAuthority,
  parseKitchenOnboardingBeneficiaryUserId,
  readKitchenOnboardingActor as actor,
} from './onboarding-actor'
import {
  serverKitchenAccessTarget,
  resolveKitchenGrantIds,
} from '../../core/access'
import {
  readKitchenAccessIds,
  withKitchenAppAccess,
} from '../../../utils/kitchen-access'
import { createMembershipAccess } from 'fireux-core/runtime/app/utils/membership/membership-access'
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

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [membership, user, place, root, actorMembership, access] =
      await Promise.all([
        mutations.read(memberships, ownerUserId),
        mutations.read(USER_MUTATION_TARGETS.runtimeUsers, ownerUserId),
        mutations.read(PLACE_MUTATION_TARGETS.places, kitchenId),
        mutations.read(KITCHEN_MUTATION_TARGETS.kitchens, kitchenId),
        ownerUserId === current.uid
          ? Promise.resolve(null)
          : mutations.read(memberships, current.uid),
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
    if (!user.exists) {
      fail(409, 'The Kitchen owner must have a User record.')
    }

    const kitchenIds = readKitchenAccessIds(
      access.data,
      membership.data,
      current.appId
    )
    const existingShell = place.exists || root.exists
    if (existingShell) {
      if (!place.exists || !root.exists) {
        fail(409, 'Kitchen shell identity is incomplete.')
      }
      if (!kitchenIds.includes(kitchenId)) {
        fail(403, 'Kitchen association is required.')
      }
    } else {
      const kitchenAccess = withKitchenAppAccess(
        access.data,
        current.appId,
        createMembershipAccess(
          resolveKitchenGrantIds(membership.data, kitchenIds, kitchenId),
          membership.data
        )
      )
      const slug = normalizeSlug(name) || kitchenId.toLowerCase()
      const created = serverAuditStamp({
        by: current.uid,
        appId: current.appId,
      })
      mutations.create(PLACE_MUTATION_TARGETS.places, kitchenId, {
        name,
        slug,
        place_type: 'non_physical',
        entity_families: ['kitchen'],
        created,
      })
      mutations.create(KITCHEN_MUTATION_TARGETS.kitchens, kitchenId, {
        identity: { source: 'user', slug, status: 'active', visibility: true },
        created,
        updated: serverAuditStamp({ by: current.uid }),
      })
      if (access.exists) {
        mutations.update<Record<string, unknown>>(
          accessTarget,
          ownerUserId,
          kitchenAccess
        )
      } else {
        mutations.create(accessTarget, ownerUserId, kitchenAccess)
      }
    }

    const slug =
      text(
        (root.data?.identity as Record<string, unknown> | undefined)?.slug
      ) || normalizeSlug(name)
    return {
      ok: true as const,
      kitchen_id: kitchenId,
      place_id: kitchenId,
      action: existingShell ? ('open' as const) : ('create' as const),
      created_root: !existingShell,
      created_team_member: false,
      owner_user_id: ownerUserId,
      ...(slug ? { slug } : {}),
    }
  })
}
