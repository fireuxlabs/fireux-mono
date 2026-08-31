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

type AppUserEntityRelationship<
  IdsField extends string,
  PrimaryField extends string,
> =
  | { [Field in IdsField | PrimaryField]?: never }
  | ({ [Field in IdsField]: string[] } & {
      [Field in PrimaryField]: string
    })

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
} & AppUserEntityRelationship<'kitchens', 'primary_kitchen'>
  & AppUserEntityRelationship<'projects', 'primary_project'>
  & AppUserEntityRelationship<'properties', 'primary_property'>
  & AppUserEntityRelationship<'portfolios', 'primary_portfolio'>
  & AppUserEntityRelationship<'suppliers', 'primary_supplier'>
  & AppUserEntityRelationship<'blanks', 'primary_blank'>
