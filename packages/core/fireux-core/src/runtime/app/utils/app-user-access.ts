// FILE: packages/core/fireux-core/src/runtime/app/utils/app-user-access.ts

import type {
  AppUserRole,
  AppUserSubscription,
} from '../models/app-user.model.ts'
import { isAppUserSubscription } from '../models/app-user.model.ts'

export type ResolvedAppUserAccess = {
  role: AppUserRole | null
  subscription: AppUserSubscription
  hasMembership: boolean
  hasAdminAuthority: boolean
  hasDeveloperAuthority: boolean
  hasPremiumSubscription: boolean
  hasBusinessSubscription: boolean
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

/** Resolve independent App governance and subscription facts. */
export function resolveAppUserAccess(
  membership: unknown
): ResolvedAppUserAccess {
  const value = asRecord(membership)
  const role: AppUserRole | null =
    value.role === 'admin' || value.role === 'user' || value.role === 'dev'
      ? value.role
      : null
  const storedSubscription: AppUserSubscription | null = isAppUserSubscription(
    value.subscription
  )
    ? value.subscription
    : null
  const hasMembership = role !== null && storedSubscription !== null
  const subscription = storedSubscription ?? 'free'

  return {
    role: hasMembership ? role : null,
    subscription,
    hasMembership,
    hasAdminAuthority: hasMembership && (role === 'admin' || role === 'dev'),
    hasDeveloperAuthority: hasMembership && role === 'dev',
    hasPremiumSubscription:
      hasMembership &&
      (subscription === 'premium' || subscription === 'business'),
    hasBusinessSubscription: hasMembership && subscription === 'business',
  }
}
