import type { FirebaseTimestamp } from '../../../types/firebase'

export const APP_USER_ROLES = ['user', 'admin', 'dev'] as const
export type AppUserRole = (typeof APP_USER_ROLES)[number]

export const APP_USER_SUBSCRIPTIONS = ['free', 'premium', 'business'] as const
export type AppUserSubscription = (typeof APP_USER_SUBSCRIPTIONS)[number]

export function isAppUserSubscription(
  value: unknown
): value is AppUserSubscription {
  return APP_USER_SUBSCRIPTIONS.includes(value as AppUserSubscription)
}

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

/** AppUser document data paired with its Firestore document id. */
export type AppUserWithId = AppUser & { id: string }

/** Input for the existing trusted AppUser creation operation. */
export type AppUserCreateInput = Partial<Omit<AppUser, 'created' | 'updated'>>
