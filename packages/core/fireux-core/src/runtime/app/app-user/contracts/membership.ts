import type { AppUserRole, AppUserSubscription } from '../models/model.ts'

/** Inputs accepted by the trusted App membership command. */
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
