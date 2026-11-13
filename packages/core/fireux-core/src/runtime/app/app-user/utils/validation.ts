import {
  APP_USER_ROLES,
  APP_USER_SUBSCRIPTIONS,
  type AppUserRole,
  type AppUserSubscription,
} from '../models/model'

export function isAppUserRole(value: unknown): value is AppUserRole {
  return APP_USER_ROLES.includes(value as AppUserRole)
}

export function isAppUserSubscription(
  value: unknown
): value is AppUserSubscription {
  return APP_USER_SUBSCRIPTIONS.includes(value as AppUserSubscription)
}

/** Read the legacy stored tier until the approved subscription migration is complete. */
export function readAppUserSubscription(
  value: unknown
): AppUserSubscription | null {
  if (value === 'premium') return 'pro'
  return isAppUserSubscription(value) ? value : null
}
