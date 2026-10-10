import type {
  AppUserRole,
  AppUserSubscription,
} from '../../models/app-user.model.ts'
import {
  isAppUserSubscription,
  isAppUserRole,
} from '../../models/app-user.model.ts'
import { serverAppUsersTarget } from '../../../utils/firestore-mutations/targets'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'
import {
  countTransactionAdmins,
  forbidden,
  requireAdmin,
  roleFrom,
  stamp,
  type MembershipTransactionState,
  type TransactionOutcome,
} from './command-contract'
import { resolveSubscriptionMutationAuthority } from './subscription.ts'

export async function handleMembershipSettings(
  state: MembershipTransactionState
): Promise<TransactionOutcome> {
  const { context, mutations, actorMembership } = state
  const { actorUid, appId, input } = context
  const memberships = serverAppUsersTarget(appId)

  if (input.action === 'set-role') {
    requireAdmin(actorMembership)
    const userId = requireFirestoreDocumentId(input.userId, 'User id')
    const role: AppUserRole = isAppUserRole(input.role)
      ? input.role
      : forbidden(400, 'Role must be user, admin, or dev.')
    const target = await mutations.read(memberships, userId)
    if (!target.exists)
      forbidden(404, 'The target App membership does not exist.')
    const previousRole = roleFrom(target.data)
    if (!previousRole)
      forbidden(409, 'The target App membership has an invalid role.')
    if (
      (previousRole === 'admin' || previousRole === 'dev') &&
      role === 'user' &&
      (await countTransactionAdmins(mutations, appId)) <= 1
    )
      forbidden(409, 'The final App administrator cannot be demoted.')
    mutations.update(memberships, userId, { role, updated: stamp(actorUid) })
    return { ok: true, action: input.action, appId, userId, role }
  }

  if (
    input.action === 'set-subscription' ||
    input.action === 'set-self-subscription'
  ) {
    const actorRole = roleFrom(actorMembership)
    const selfDeveloperChange = input.action === 'set-self-subscription'
    const authority = resolveSubscriptionMutationAuthority({
      action: input.action,
      actorUid,
      actorRole,
      ...(!selfDeveloperChange ? { userId: input.userId } : {}),
    })
    if (!authority.ok) forbidden(authority.statusCode, authority.message)
    const userId = requireFirestoreDocumentId(authority.userId, 'User id')
    const subscription: AppUserSubscription = isAppUserSubscription(
      input.subscription
    )
      ? input.subscription
      : forbidden(400, 'Subscription must be free, premium, or business.')
    if (!(await mutations.read(memberships, userId)).exists)
      forbidden(404, 'The target App membership does not exist.')
    mutations.update(memberships, userId, {
      subscription,
      updated: stamp(actorUid),
    })
    return {
      ok: true,
      action: input.action,
      appId,
      userId,
      subscription,
    }
  }

  return forbidden(400, 'Membership settings action is required.')
}
