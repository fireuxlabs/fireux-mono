import type { FirebaseTimestamp } from '../../../types/firebase'

export const APP_USER_ROLES = ['user', 'admin', 'dev'] as const
export type AppUserRole = (typeof APP_USER_ROLES)[number]

export const APP_USER_SUBSCRIPTIONS = ['free', 'premium'] as const
export type AppUserSubscription = (typeof APP_USER_SUBSCRIPTIONS)[number]

export const APP_USER_ONBOARDING_STATUSES = [
  'pending',
  'completed',
  'skipped',
] as const
export type AppUserOnboardingStatus =
  (typeof APP_USER_ONBOARDING_STATUSES)[number]

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
