// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: define the trusted runtime App membership mutation contract.

export type AppMembershipRole = 'admin' | 'user'

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
      role: AppMembershipRole
    }
  | {
      action: 'set-premium'
      userId: string
      isPremium: boolean
    }
  | {
      action: 'remove-member'
      userId?: string
    }
  | {
      action: 'set-console-target'
      family: string
      targetId: string
      enabled: boolean
    }
  | {
      action: 'set-profile'
      profileId: string
      enabled: boolean
    }

export type AppMembershipMutationResult = {
  ok: true
  action: AppMembershipMutationInput['action']
  appId: string
  userId: string
  created?: boolean
  removed?: boolean
  role?: AppMembershipRole
  isPremium?: boolean
  requested?: boolean
}
