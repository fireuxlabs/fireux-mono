// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: remove browser-owned App role, premium, and membership mirror writes.
// Concurrent edit — 2026-07-20 17:34 CEST — Repo Efficiency Pass 2 of 6: remove browser-authored notification compatibility actions.

import { useFireUXConfig } from './config/FireUXConfig'
import type { Ref } from 'vue'
import type { User } from '../../user/models/user.model'
import { runAppUserCommand } from './runAppUserCommand'
import type { AppUserSubscription } from '../models/app-user.model.ts'

type AppMembershipActions = {
  /** Single, canonical role toggle (admin <-> user). */
  setAdmin: (makeAdmin: boolean) => Promise<void>

  /** App-scoped subscription selected by an authorized actor. */
  setSubscription: (subscription: AppUserSubscription) => Promise<void>

  /** Completes or deliberately skips the current App's onboarding. */
  setOnboardingStatus: (status: 'completed' | 'skipped') => Promise<void>

  /** Leaves the current App by removing its AppUser relationship and references. */
  leave: () => Promise<void>
}

export function useAppUserCommands(user: {
  coreUser: Ref<User | null | undefined>
  user: Ref<User | null | undefined>
}) {
  const cfg = useFireUXConfig()

  const requireContext = () => {
    const uid = user.coreUser?.value?.id ?? user.user?.value?.id
    if (!uid) throw new Error('[useAppUserCommands] Missing User id')

    const appId = cfg.appId
    if (!appId) throw new Error('[useAppUserCommands] Missing App id')

    return { uid, appId }
  }

  const membership: AppMembershipActions = {
    setAdmin: async (makeAdmin) => {
      const { uid } = requireContext()
      const role = makeAdmin ? 'admin' : 'user'
      await runAppUserCommand({
        action: 'set-role',
        userId: uid,
        role,
      })
    },
    setSubscription: async (subscription) => {
      const { uid } = requireContext()
      await runAppUserCommand({
        action: 'set-subscription',
        userId: uid,
        subscription,
      })
    },
    setOnboardingStatus: async (status) => {
      await runAppUserCommand({
        action: 'set-onboarding-status',
        status,
      })
    },
    leave: async () => {
      const { uid } = requireContext()
      await runAppUserCommand({
        action: 'remove-member',
        userId: uid,
      })
    },
  }

  return {
    membership,
  }
}
