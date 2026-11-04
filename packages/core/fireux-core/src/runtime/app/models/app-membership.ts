// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: define the trusted runtime App membership mutation contract.
// Concurrent edit — 2026-07-20 17:49 CEST — Repo Efficiency Pass 2 of 6: keep profile indexing inside trusted profile provisioning.

import type { AppUserRole, AppUserSubscription } from './app-user.model.ts'

export type AppMembershipMutationInput =
  | { action: 'ensure-self' }
  | { action: 'bootstrap-admin' }
  | {
      action: 'set-role'
      userId: string
      role: AppUserRole
    }
  | {
      action: 'set-subscription'
      userId: string
      subscription: AppUserSubscription
    }
  | {
      action: 'set-self-subscription'
      subscription: AppUserSubscription
    }
  | {
      action: 'remove-member'
      userId?: string
    }

export type AppMembershipMutationResult = {
  ok: true
  action: AppMembershipMutationInput['action']
  appId: string
  userId: string
  created?: boolean
  removed?: boolean
  role?: AppUserRole
  subscription?: AppUserSubscription
}
