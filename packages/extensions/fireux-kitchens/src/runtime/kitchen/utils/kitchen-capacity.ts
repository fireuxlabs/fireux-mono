import type { FireuxAppSubscriptionCapacity } from 'fireux-core/config/app/types'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/utils/app-user-access'
import { appSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
/** Maximum retained Kitchen associations on one App membership. */
export const KITCHEN_USER_LIMIT = 50

export const kitchenCapacity = {
  kitchen: { free: 1, premium: 1, business: null },
} satisfies FireuxAppSubscriptionCapacity

export function kitchenAssociationIds(membership: unknown): string[] {
  const value =
    membership && typeof membership === 'object'
      ? (membership as Record<string, unknown>).kitchens
      : undefined
  return [
    ...new Set(
      (Array.isArray(value) ? value : [])
        .map((id) => String(id ?? '').trim())
        .filter(Boolean)
    ),
  ]
}

/** Account allowance only; onboarding still checks authority for the target Kitchen. */
export function resolveKitchenAllowance(membership: unknown) {
  const access = resolveAppUserAccess(membership)
  const used = kitchenAssociationIds(membership).length
  const limit = appSubscriptionCapacity(
    kitchenCapacity,
    'kitchen',
    access.subscription
  )
  const hasCapacity = limit === null || used < limit
  return {
    subscription: access.subscription,
    used,
    limit,
    hasCapacity,
    canAdd: access.hasMembership && hasCapacity && used < KITCHEN_USER_LIMIT,
    showUpgrade:
      access.hasMembership &&
      !hasCapacity &&
      access.subscription !== 'business',
  }
}
