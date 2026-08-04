import type { AppUserRole } from '../../../models/core/user.model'
import { requireFirestoreDocumentId } from '../ids/path'
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
  const {
    context,
    transaction,
    appRef,
    membershipCollection,
    actorMembershipRef,
    actorMembershipSnapshot,
    actorMembership,
  } = state
  const { actorUid, appId, input } = context

  if (input.action === 'set-role') {
    requireAdmin(actorMembership)
    const userId = requireFirestoreDocumentId(input.userId, 'User id')
    const role: AppUserRole =
      input.role === 'admin' || input.role === 'user'
        ? input.role
        : forbidden(400, 'Role must be admin or user.')
    const targetMembershipRef = membershipCollection.doc(userId)
    const targetMembershipSnapshot = await transaction.get(targetMembershipRef)
    if (!targetMembershipSnapshot.exists) {
      forbidden(404, 'The target App membership does not exist.')
    }
    const previousRole = roleFrom(targetMembershipSnapshot.data())
    if (!previousRole) {
      forbidden(409, 'The target App membership has an invalid role.')
    }
    if (
      previousRole === 'admin' &&
      role === 'user' &&
      (await countTransactionAdmins(transaction, appRef)) <= 1
    ) {
      forbidden(409, 'The final App administrator cannot be demoted.')
    }
  
    transaction.update(targetMembershipRef, {
      role,
      ...(role === 'admin' ? { console_enabled: true } : {}),
      updated: stamp(actorUid),
    })
    return {
      ok: true,
      action: input.action,
      appId,
      userId,
      role,
      identityMirror: null,
    }
  }

  if (input.action === 'set-premium') {
    requireAdmin(actorMembership)
    const userId = requireFirestoreDocumentId(input.userId, 'User id')
    if (typeof input.isPremium !== 'boolean') {
      forbidden(400, 'Premium state must be boolean.')
    }
    const targetMembershipRef = membershipCollection.doc(userId)
    const targetMembershipSnapshot = await transaction.get(targetMembershipRef)
    if (!targetMembershipSnapshot.exists) {
      forbidden(404, 'The target App membership does not exist.')
    }
    transaction.update(targetMembershipRef, {
      is_premium: input.isPremium,
      updated: stamp(actorUid),
    })
    return {
      ok: true,
      action: input.action,
      appId,
      userId,
      isPremium: input.isPremium,
      identityMirror: null,
    }
  }

  if (input.action === 'set-onboarding-status') {
    if (!actorMembershipSnapshot.exists) {
      forbidden(409, 'The current App membership does not exist.')
    }
    if (!roleFrom(actorMembership)) {
      forbidden(409, 'The existing App membership has an invalid role.')
    }
    const status =
      input.status === 'completed' || input.status === 'skipped'
        ? input.status
        : forbidden(400, 'Onboarding status must be completed or skipped.')

    transaction.update(actorMembershipRef, {
      onboarding_status: status,
      updated: stamp(actorUid),
    })
    return {
      ok: true,
      action: input.action,
      appId,
      userId: actorUid,
      onboardingStatus: status,
      identityMirror: null,
    }
  }

  return forbidden(400, 'Membership settings action is required.')
}
