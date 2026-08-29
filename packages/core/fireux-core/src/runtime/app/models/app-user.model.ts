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

export type AppUser = {
  role: AppUserRole
  subscription: AppUserSubscription
  onboarding_status: AppUserOnboardingStatus
  kitchens: string[]
  primary_kitchen: string
  projects: string[]
  primary_project: string
  properties: string[]
  primary_property: string
  portfolios: string[]
  primary_portfolio: string
  suppliers: string[]
  primary_supplier: string
  blanks: string[]
  primary_blank: string
  created: {
    at: FirebaseTimestamp
    by?: string
  }
  updated: {
    at: FirebaseTimestamp
    by?: string
  }
}
