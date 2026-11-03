import type { FireuxStamps } from '../../models/utils/stamps.model'

export const APP_USER_ROLES = ['user', 'admin', 'dev'] as const
export type AppUserRole = (typeof APP_USER_ROLES)[number]

export const APP_USER_SUBSCRIPTIONS = ['free', 'premium', 'business'] as const
export type AppUserSubscription = (typeof APP_USER_SUBSCRIPTIONS)[number]

export function isAppUserRole(value: unknown): value is AppUserRole {
  return APP_USER_ROLES.includes(value as AppUserRole)
}

export function isAppUserSubscription(
  value: unknown
): value is AppUserSubscription {
  return APP_USER_SUBSCRIPTIONS.includes(value as AppUserSubscription)
}

/** Membership of one User in one App. Domains own their own access records. */
export type AppUser = FireuxStamps & {
  role: AppUserRole
  subscription: AppUserSubscription
}

/** AppUser document data paired with its Firestore document id. */
export type AppUserWithId = AppUser & { id: string }
