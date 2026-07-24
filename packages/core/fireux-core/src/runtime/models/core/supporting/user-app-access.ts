// FILE: packages/core/fireux-core/src/runtime/models/core/supporting/user-app-access.ts

export type UserAppAccessTier = 'free' | 'premium' | 'admin' | 'dev'
export type UserAppMembershipRole = 'user' | 'admin'

export type ResolvedUserAppAccess = {
  tier: UserAppAccessTier | null
  role: UserAppMembershipRole | null
  hasMembership: boolean
  hasAdminAuthority: boolean
  hasExplicitPremiumEntitlement: boolean
  hasPremiumAccess: boolean
  isConfiguredDeveloper: boolean
}

type ResolveUserAppAccessInput = {
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
 * Stored UserApp authority remains orthogonal:
 * - `role` controls App governance.
 * - `is_premium` records an explicitly granted premium entitlement.
 * - the configured developer identity is runtime authority, never a stored role.
 *
 * `dev` therefore overlays a real App membership; it never manufactures one.
 * This resolver is presentation/capability logic and must not replace server or
 * Firestore Rules authorization.
 */
export function resolveUserAppAccess(
  input: ResolveUserAppAccessInput
): ResolvedUserAppAccess {
  const membership = asRecord(input.membership)
  const role: UserAppMembershipRole | null =
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

  const tier: UserAppAccessTier | null = !hasMembership
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

export function hasUserAppPremiumAccess(
  membership: unknown,
  options: { isConfiguredDeveloper?: boolean } = {}
): boolean {
  return resolveUserAppAccess({
    membership,
    isConfiguredDeveloper: options.isConfiguredDeveloper,
  }).hasPremiumAccess
}
