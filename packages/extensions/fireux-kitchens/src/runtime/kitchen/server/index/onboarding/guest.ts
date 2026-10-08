import { createDefaultKitchenStation } from '../../stations/default'
import type { H3Event } from 'h3'
import { guestKitchenClaimTarget, hashGuestKitchenSecret } from './adoption'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverKitchenMenusTarget,
  serverKitchenTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { resolveWorkspaceEntityOnboardingPolicy } from 'fireux-core/runtime/server/utils/workspace-entity/onboarding-authority'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { buildKitchenTeamMemberRecord } from '../../team/member-record'
import { createKitchenSystemMenus } from './system-menus'
import { fail, readKitchenOnboardingRequest } from './request'

/** One real, unpublished Kitchen per anonymous identity; no AppUser is fabricated. */
export async function startGuestKitchen(event: H3Event, input: unknown) {
  const body = readKitchenOnboardingRequest(input, ['claim_secret'])
  const secretHash = hashGuestKitchenSecret(body.claim_secret)
  const { uid, decoded } = await requireFirebaseBearerUser(
    event,
    'A guest identity is required.',
    { allowAnonymous: true }
  )
  if (decoded.firebase?.sign_in_provider !== 'anonymous')
    fail(403, 'Use your account to add a Kitchen.')
  const policy = resolveWorkspaceEntityOnboardingPolicy(event, 'kitchen')
  if (!policy.canCreate)
    fail(403, 'Kitchen creation is unavailable in this App.')
  const id = requireFirestoreDocumentId(uid, 'Guest identity')
  const claimTarget = guestKitchenClaimTarget(id)
  const team = serverKitchenTeamMembersTarget(id)
  const menus = serverKitchenMenusTarget(id)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const [root, place, member, systemMenus, claim] = await Promise.all([
      tx.read(FIRESTORE_MUTATION_TARGETS.kitchens, id),
      tx.read(FIRESTORE_MUTATION_TARGETS.places, id),
      tx.read(team, uid),
      tx.readAll(menus, 1),
      tx.read(claimTarget, 'guest'),
    ])
    if (claim.data?.claimed_by)
      fail(409, 'This Kitchen is already connected to an account.')
    if (root.exists || place.exists || member.exists) {
      const created = root.data?.created as
        | { by?: string; app_id?: string }
        | undefined
      if (
        !root.exists ||
        !place.exists ||
        !member.exists ||
        created?.by !== uid ||
        created.app_id !== policy.appId ||
        member.data?.user_id !== uid
      )
        fail(409, 'This guest Kitchen could not be resumed.')
    } else {
      const created = serverAuditStamp({ by: uid, appId: policy.appId })
      const name = `kitchen-${id.slice(0, 6)}`
      tx.create(FIRESTORE_MUTATION_TARGETS.places, id, {
        name,
        slug: id.toLowerCase(),
        place_type: 'non_physical',
        entity_families: ['kitchen'],
        created,
      })
      tx.create(FIRESTORE_MUTATION_TARGETS.kitchens, id, {
        identity: {
          source: 'user',
          slug: id.toLowerCase(),
          status: 'active',
          visibility: false,
        },
        created,
      })
      tx.create(
        team,
        uid,
        buildKitchenTeamMemberRecord({ name: 'Guest', userId: uid })
      )
      createKitchenSystemMenus({
        mutations: tx,
        target: menus,
        kitchenId: id,
        menus: systemMenus,
        created,
      })
      createDefaultKitchenStation(tx, id, created)
    }
    if (!claim.exists)
      tx.create(claimTarget, 'guest', { secret_hash: secretHash })
    else if (claim.data?.secret_hash !== secretHash)
      tx.update(claimTarget, 'guest', { secret_hash: secretHash })
    return { kitchen_id: id }
  })
}
