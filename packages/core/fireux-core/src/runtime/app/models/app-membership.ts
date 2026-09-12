// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: define the trusted runtime App membership mutation contract.
// Concurrent edit — 2026-07-20 17:49 CEST — Repo Efficiency Pass 2 of 6: keep profile indexing inside trusted profile provisioning.

import type { AppUserRole, AppUserSubscription } from './app-user.model.ts'

export const AppJoinRequestStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/join-requests/{userId}',
  collection: 'join-requests',
  parent: 'app',
  idParam: 'userId',
} as const

export const AppMembershipBlockStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/membership-blocks/{userId}',
  collection: 'membership-blocks',
  parent: 'app',
  idParam: 'userId',
} as const

export type AppJoinRequest = {
  id: string
  user_id: string
  created: {
    at: unknown
    by: string
    app_id: string
  }
}

export type AppMembershipMutationInput =
  | { action: 'ensure-self' }
  | { action: 'bootstrap-admin' }
  | { action: 'request-join' }
  | {
      action: 'review-join'
      userId: string
      approve: boolean
    }
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
  requested?: boolean
}
