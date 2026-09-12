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

export const APP_USER_ONBOARDING_STATUSES = [
  'pending',
  'completed',
  'skipped',
] as const
export type AppUserOnboardingStatus =
  (typeof APP_USER_ONBOARDING_STATUSES)[number]

/** Membership of one User in one App. Domains own their own access records. */
export type AppUser = {
  role: AppUserRole
  subscription: AppUserSubscription
  onboarding_status: AppUserOnboardingStatus
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
