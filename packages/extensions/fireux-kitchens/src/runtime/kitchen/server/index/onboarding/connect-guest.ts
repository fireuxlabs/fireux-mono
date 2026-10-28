import { timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { KITCHEN_MUTATION_TARGETS, serverKitchenTeamMembersTarget } from '../../mutation-targets'
import { USER_MUTATION_TARGETS } from 'fireux-core/runtime/user/server/mutation-targets'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import { buildKitchenTeamMemberRecord } from '../../team/member-record.ts'
import { readKitchenOnboardingActor as actor } from './onboarding-actor'
import {
  onboardingText as text,
  requireOnboardingMemberRole,
} from './onboarding-policy'
import {
  serverKitchenAccessTarget,
  resolveKitchenGrantIds,
} from '../../core/access'
import {
  readKitchenAccessIds,
  withKitchenAppAccess,
} from '../../../utils/kitchen-access'
import { createMembershipAccess } from 'fireux-core/runtime/app/utils/membership-access'
import { guestKitchenClaimTarget, hashGuestKitchenSecret } from './guest-claim'

import { fail } from './request'

function request(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail(400, 'Kitchen adoption request must be an object.')
  const source = value as Record<string, unknown>
  const supported = new Set(['kitchen_id', 'claim_secret'])
  const unsupported = Object.keys(source).find((key) => !supported.has(key))
  if (unsupported)
    fail(400, `Kitchen adoption contains unsupported field: ${unsupported}.`)
  return source
}

export async function connectGuestKitchen(event: H3Event, input: unknown) {
  const body = request(input)
  const kitchenId = requireFirestoreDocumentId(body.kitchen_id, 'Kitchen id')
  const secretHash = hashGuestKitchenSecret(body.claim_secret)
  const current = await actor(event, { deferMembership: true })
  const claimTarget = guestKitchenClaimTarget(kitchenId)
  // Guest Kitchens use their original anonymous uid as their stable id.
  const anonymousUid = kitchenId

  const teamMembers = serverKitchenTeamMembersTarget(kitchenId)
  const memberships = serverAppUsersTarget(current.appId)
  const accessTarget = serverKitchenAccessTarget()
  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [
      root,
      anonymousMember,
      currentMember,
      user,
      membership,
      access,
      claim,
    ] = await Promise.all([
      mutations.read(KITCHEN_MUTATION_TARGETS.kitchens, kitchenId),
      mutations.read(teamMembers, anonymousUid),
      mutations.read(teamMembers, current.uid),
      mutations.read(USER_MUTATION_TARGETS.runtimeUsers, current.uid),
      mutations.read(memberships, current.uid),
      mutations.read(accessTarget, current.uid),
      mutations.read(claimTarget, 'guest'),
    ])
    const storedHash = text(claim.data?.secret_hash)
    if (
      !claim.exists ||
      !/^[a-f0-9]{64}$/.test(storedHash) ||
      !timingSafeEqual(
        Buffer.from(storedHash, 'hex'),
        Buffer.from(secretHash, 'hex')
      )
    )
      fail(403, 'Kitchen recovery proof is invalid.')
    requireOnboardingMemberRole(membership.exists, membership.data?.role)
    const ids = readKitchenAccessIds(
      access.data,
      membership.data,
      current.appId
    )
    const rootCreated = root.data?.created as
      | Record<string, unknown>
      | undefined
    if (
      !root.exists ||
      text(rootCreated?.by) !== anonymousUid ||
      text(rootCreated?.app_id) !== current.appId
    )
      fail(403, 'This anonymous identity did not create the Kitchen.')
    if (claim.data?.claimed_by) {
      if (claim.data.claimed_by !== current.uid)
        fail(409, 'This Kitchen has already been connected to another account.')
      if (
        !ids.includes(kitchenId) ||
        !currentMember.exists ||
        currentMember.data?.user_id !== current.uid
      )
        fail(403, 'This account no longer has access to the Kitchen.')
      return { ok: true as const, kitchen_id: kitchenId, adopted: false }
    }
    if (
      !anonymousMember.exists ||
      text(anonymousMember.data?.user_id) !== anonymousUid
    )
      fail(409, 'Anonymous Kitchen ownership is incomplete.')

    const name = text(user.data?.display_name)
    if (!user.exists || !name) fail(409, 'Finish your User profile first.')
    const nextAccess = withKitchenAppAccess(
      access.data,
      current.appId,
      createMembershipAccess(
        resolveKitchenGrantIds(membership.data, ids, kitchenId),
        membership.data
      )
    )
    if (currentMember.exists) {
      mutations.update(teamMembers, current.uid, {
        user_id: current.uid,
        name,
      })
    } else {
      mutations.create(
        teamMembers,
        current.uid,
        buildKitchenTeamMemberRecord({
          name,
          userId: current.uid,
        })
      )
    }
    if (anonymousUid !== current.uid)
      mutations.delete(teamMembers, anonymousUid)
    mutations.update(claimTarget, 'guest', { claimed_by: current.uid })
    if (access.exists)
      mutations.update<Record<string, unknown>>(
        accessTarget,
        current.uid,
        nextAccess
      )
    else mutations.create(accessTarget, current.uid, nextAccess)
    return { ok: true as const, kitchen_id: kitchenId, adopted: true }
  })
}
