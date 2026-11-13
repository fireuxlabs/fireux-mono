import type { FirebaseTimestamp } from '../../../../types/firebase'

export const APP_USER_ROLES = ['user', 'admin', 'dev'] as const

export type AppUserRole = (typeof APP_USER_ROLES)[number]

export const APP_USER_SUBSCRIPTIONS = ['free', 'pro', 'business'] as const

export type AppUserSubscription = (typeof APP_USER_SUBSCRIPTIONS)[number]

/** Membership of one User in one App. Domains own their own access records. */
export type AppUser = {
  role: AppUserRole
  subscription: AppUserSubscription
  created: {
    at: FirebaseTimestamp
    by?: string
  }
  updated: {
    at: FirebaseTimestamp
    by?: string
  }
}
