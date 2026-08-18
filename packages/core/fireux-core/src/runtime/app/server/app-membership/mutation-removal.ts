import { FieldValue } from 'firebase-admin/firestore'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppDriversTarget,
  serverAppJoinRequestsTarget,
  serverAppMembershipBlocksTarget,
  serverAppUsersTarget,
} from '../../../utils/firestore-mutations/targets'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'
import {
  appGovernancePatch,
  countTransactionAdmins,
  forbidden,
  isAdminMembership,
  readTargetAuthorityRevocations,
  requireAdmin,
  revokedDriverLinks,
  stamp,
  type MembershipTransactionState,
  type TransactionOutcome,
} from './mutation-contract'

export async function handleRemoveMember(
  state: MembershipTransactionState
): Promise<TransactionOutcome> {
  const { context, mutations, actorMembershipExists, actorMembership } = state
  const { actorUid, appId, input } = context
  if (input.action !== 'remove-member')
    return forbidden(400, 'Remove-member action is required.')
  const userId = requireFirestoreDocumentId(input.userId || actorUid, 'User id')
  if (userId !== actorUid) requireAdmin(actorMembership)

  const memberships = serverAppUsersTarget(appId)
  const target = userId === actorUid
    ? { exists: actorMembershipExists, data: actorMembership }
    : await mutations.read(memberships, userId)
  if (target.exists && isAdminMembership(target.data) &&
      (await countTransactionAdmins(mutations, appId)) <= 1)
    forbidden(409, 'The final App administrator cannot leave or be removed.')

  const joins = serverAppJoinRequestsTarget(appId)
  const blocks = serverAppMembershipBlocksTarget(appId)
  const drivers = serverAppDriversTarget(appId)
  const [join, block, driver, authority] = await Promise.all([
    mutations.read(joins, userId),
    mutations.read(blocks, userId),
    mutations.read(drivers, userId),
    readTargetAuthorityRevocations(mutations, appId, userId),
  ])
  if (target.exists) mutations.delete(memberships, userId)
  if (join.exists) mutations.delete(joins, userId)
  for (const grant of authority)
    mutations.update(grant.target, grant.id, {
      operator_ids: FieldValue.arrayRemove(userId),
      team_ids: FieldValue.arrayRemove(userId),
      updated: stamp(actorUid),
    })
  if (driver.exists)
    mutations.update(drivers, userId, {
      active_kitchen_ids: [],
      kitchen_links: revokedDriverLinks(driver.data ?? {}),
      updated: stamp(actorUid),
    })
  if (userId !== actorUid) {
    const payload = { user_id: userId, blocked: stamp(actorUid) }
    if (block.exists) mutations.update(blocks, userId, payload)
    else mutations.create(blocks, userId, payload)
  }
  if (target.exists)
    mutations.update(FIRESTORE_MUTATION_TARGETS.runtimeApps, appId,
      appGovernancePatch(actorUid))
  return { ok: true, action: input.action, appId, userId, removed: target.exists }
}
