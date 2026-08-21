// FILE: packages/core/fireux-core/src/runtime/app/utils/app-user-access.ts

import type { AppUserRole } from '../models/app-user.model.ts'

export type AppUserAccessTier = 'free' | 'premium' | 'admin' | 'dev'

export type ResolvedAppUserAccess = {
  tier: AppUserAccessTier | null
  role: AppUserRole | null
  hasMembership: boolean
  hasAdminAuthority: boolean
  hasExplicitPremiumEntitlement: boolean
  hasPremiumAccess: boolean
  isConfiguredDeveloper: boolean
}

type ResolveAppUserAccessInput = {
  membership?: unknown
  isConfiguredDeveloper?: boolean
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

/**
 * Resolve the current App's display tier and product capability implications.
 *
 * Stored AppUser authority remains orthogonal:
 * - `role` controls App governance.
 * - `is_premium` records an explicitly granted premium entitlement.
 * - the configured developer identity is runtime authority, never a stored role.
 *
 * `dev` therefore overlays a real App membership; it never manufactures one.
 * This resolver is presentation/capability logic and must not replace server or
 * Firestore Rules authorization.
 */
export function resolveAppUserAccess(
  input: ResolveAppUserAccessInput
): ResolvedAppUserAccess {
  const membership = asRecord(input.membership)
  const role: AppUserRole | null =
    membership.role === 'admin' || membership.role === 'user'
      ? membership.role
      : null
  const hasMembership = role !== null
  const hasAdminAuthority = role === 'admin'
  const hasExplicitPremiumEntitlement =
    hasMembership && membership.is_premium === true
  const isConfiguredDeveloper = input.isConfiguredDeveloper === true
  const hasPremiumAccess =
    hasMembership &&
    (isConfiguredDeveloper ||
      hasAdminAuthority ||
      hasExplicitPremiumEntitlement)

  const tier: AppUserAccessTier | null = !hasMembership
    ? null
    : isConfiguredDeveloper
      ? 'dev'
      : hasAdminAuthority
        ? 'admin'
        : hasExplicitPremiumEntitlement
          ? 'premium'
          : 'free'

  return {
    tier,
    role,
    hasMembership,
    hasAdminAuthority,
    hasExplicitPremiumEntitlement,
    hasPremiumAccess,
    isConfiguredDeveloper,
  }
}

export function hasAppUserPremiumAccess(
  membership: unknown,
  options: { isConfiguredDeveloper?: boolean } = {}
): boolean {
  return resolveAppUserAccess({
    membership,
    isConfiguredDeveloper: options.isConfiguredDeveloper,
  }).hasPremiumAccess
}
