// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: remove browser-owned App role, premium, and membership mirror writes.
// Concurrent edit — 2026-07-20 17:34 CEST — Repo Efficiency Pass 2 of 6: remove browser-authored notification compatibility actions.

import { useFireUXConfig } from '../../../../../app/composables/config/FireUXConfig'
import type { UserSessionRead } from '../../fetch/useUserRead'
import type { CurrentAppUserRead } from '../../../../../app/composables/firestore/fetch/useAppUserRead'
import { mutateAppMembership } from '../appMembershipMutation'
import type { AppUserSubscription } from '../../../../../app/models/app-user.model.ts'

type AppMembershipActions = {
  /** Single, canonical role toggle (admin <-> user). */
  setAdmin: (makeAdmin: boolean) => Promise<void>

  /** App-scoped subscription selected by an authorized actor. */
  setSubscription: (subscription: AppUserSubscription) => Promise<void>

  /** Completes or deliberately skips the current App's onboarding. */
  setOnboardingStatus: (status: 'completed' | 'skipped') => Promise<void>

  /** Leaves the current app (removes membership overlay + mirrors). */
  leave: () => Promise<void>
}

export function useAppUserUpdate(user: UserSessionRead & CurrentAppUserRead) {
  const cfg = useFireUXConfig()

  const requireContext = () => {
    const uid = user.coreUser?.value?.id ?? user.user?.value?.id
    if (!uid) throw new Error('[useAppUserUpdate] Missing core user uid')

    const appId = cfg.appId
    if (!appId) throw new Error('[useAppUserUpdate] Missing appId')

    return { uid, appId }
  }

  const membership: AppMembershipActions = {
    setAdmin: async (makeAdmin) => {
      const { uid } = requireContext()
      const role = makeAdmin ? 'admin' : 'user'
      await mutateAppMembership({
        action: 'set-role',
        userId: uid,
        role,
      })
    },
    setSubscription: async (subscription) => {
      const { uid } = requireContext()
      await mutateAppMembership({
        action: 'set-subscription',
        userId: uid,
        subscription,
      })
    },
    setOnboardingStatus: async (status) => {
      await mutateAppMembership({
        action: 'set-onboarding-status',
        status,
      })
    },
    leave: async () => {
      const { uid } = requireContext()
      await mutateAppMembership({
        action: 'remove-member',
        userId: uid,
      })
    },
  }

  return {
    membership,
  }
}
