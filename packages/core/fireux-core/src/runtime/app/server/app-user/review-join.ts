import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppJoinRequestsTarget,
  serverAppMembershipBlocksTarget,
  serverAppUsersTarget,
} from '../../../utils/firestore-mutations/targets'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'
import {
  appGovernancePatch,
  forbidden,
  initialMembership,
  requireAdmin,
  roleFrom,
  type MembershipTransactionState,
  type TransactionOutcome,
} from './command-contract'

export async function handleReviewJoin(
  state: MembershipTransactionState,
  crossDatabaseUserVerified: boolean
): Promise<TransactionOutcome> {
  const { context, mutations, actorMembership } = state
  const { actorUid, appId, input } = context
  if (input.action !== 'review-join')
    return forbidden(400, 'Review-join action is required.')
  requireAdmin(actorMembership)
  const userId = requireFirestoreDocumentId(input.userId, 'User id')
  const memberships = serverAppUsersTarget(appId)
  const joins = serverAppJoinRequestsTarget(appId)
  const blocks = serverAppMembershipBlocksTarget(appId)
  const target = await mutations.read(memberships, userId)
  if (
    input.approve &&
    !crossDatabaseUserVerified &&
    !(await mutations.read(FIRESTORE_MUTATION_TARGETS.runtimeUsers, userId))
      .exists
  )
    forbidden(409, 'The public User record does not exist.')
  const join = await mutations.read(joins, userId)
  const block = input.approve ? await mutations.read(blocks, userId) : null

  const created = input.approve && !target.exists
  if (input.approve) {
    if (created)
      mutations.create(memberships, userId, initialMembership(actorUid, 'user'))
    if (block?.exists) mutations.delete(blocks, userId)
  }
  mutations.update(
    FIRESTORE_MUTATION_TARGETS.runtimeApps,
    appId,
    appGovernancePatch(actorUid)
  )
  if (join.exists) mutations.delete(joins, userId)
  return {
    ok: true,
    action: input.action,
    appId,
    userId,
    created,
    role: input.approve ? (roleFrom(target.data) ?? 'user') : undefined,
  }
}
