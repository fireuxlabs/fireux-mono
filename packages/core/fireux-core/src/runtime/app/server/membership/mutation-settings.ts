import type { AppUserRole } from '../../../user/models/user.model.ts'
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
} from './mutation-contract'

export async function handleMembershipSettings(
  state: MembershipTransactionState
): Promise<TransactionOutcome> {
  const { context, mutations, actorMembershipExists, actorMembership } = state
  const { actorUid, appId, input } = context
  const memberships = serverAppUsersTarget(appId)

  if (input.action === 'set-role') {
    requireAdmin(actorMembership)
    const userId = requireFirestoreDocumentId(input.userId, 'User id')
    const role: AppUserRole =
      input.role === 'admin' || input.role === 'user'
        ? input.role
        : forbidden(400, 'Role must be admin or user.')
    const target = await mutations.read(memberships, userId)
    if (!target.exists)
      forbidden(404, 'The target App membership does not exist.')
    const previousRole = roleFrom(target.data)
    if (!previousRole)
      forbidden(409, 'The target App membership has an invalid role.')
    if (
      previousRole === 'admin' &&
      role === 'user' &&
      (await countTransactionAdmins(mutations, appId)) <= 1
    )
      forbidden(409, 'The final App administrator cannot be demoted.')
    mutations.update(memberships, userId, { role, updated: stamp(actorUid) })
    return { ok: true, action: input.action, appId, userId, role }
  }

  if (input.action === 'set-premium') {
    requireAdmin(actorMembership)
    const userId = requireFirestoreDocumentId(input.userId, 'User id')
    if (typeof input.isPremium !== 'boolean')
      forbidden(400, 'Premium state must be boolean.')
    if (!(await mutations.read(memberships, userId)).exists)
      forbidden(404, 'The target App membership does not exist.')
    mutations.update(memberships, userId, {
      is_premium: input.isPremium,
      updated: stamp(actorUid),
    })
    return {
      ok: true,
      action: input.action,
      appId,
      userId,
      isPremium: input.isPremium,
    }
  }

  if (input.action === 'set-onboarding-status') {
    if (!actorMembershipExists)
      forbidden(409, 'The current App membership does not exist.')
    if (!roleFrom(actorMembership))
      forbidden(409, 'The existing App membership has an invalid role.')
    const status =
      input.status === 'completed' || input.status === 'skipped'
        ? input.status
        : forbidden(400, 'Onboarding status must be completed or skipped.')
    mutations.update(memberships, actorUid, {
      onboarding_status: status,
      updated: stamp(actorUid),
    })
    return {
      ok: true,
      action: input.action,
      appId,
      userId: actorUid,
      onboardingStatus: status,
    }
  }
  return forbidden(400, 'Membership settings action is required.')
}
