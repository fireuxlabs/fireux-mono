import { APP_MUTATION_TARGETS, serverAppJoinRequestsTarget, serverAppMembershipBlocksTarget, serverAppUsersTarget } from '../mutation-targets'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'
import {
  appGovernancePatch,
  countTransactionAdmins,
  forbidden,
  isAdminMembership,
  requireAdmin,
  stamp,
  type MembershipTransactionState,
  type TransactionOutcome,
} from './command-contract'

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
  const target =
    userId === actorUid
      ? { exists: actorMembershipExists, data: actorMembership }
      : await mutations.read(memberships, userId)
  if (
    target.exists &&
    isAdminMembership(target.data) &&
    (await countTransactionAdmins(mutations, appId)) <= 1
  )
    forbidden(409, 'The final App administrator cannot leave or be removed.')

  const joins = serverAppJoinRequestsTarget(appId)
  const blocks = serverAppMembershipBlocksTarget(appId)
  const [join, block] = await Promise.all([
    mutations.read(joins, userId),
    mutations.read(blocks, userId),
  ])
  if (target.exists) mutations.delete(memberships, userId)
  if (join.exists) mutations.delete(joins, userId)
  if (userId !== actorUid) {
    const payload = { user_id: userId, blocked: stamp(actorUid) }
    if (block.exists) mutations.update(blocks, userId, payload)
    else mutations.create(blocks, userId, payload)
  }
  if (target.exists)
    mutations.update(
      APP_MUTATION_TARGETS.runtimeApps,
      appId,
      appGovernancePatch(actorUid)
    )
  return {
    ok: true,
    action: input.action,
    appId,
    userId,
    removed: target.exists,
  }
}
