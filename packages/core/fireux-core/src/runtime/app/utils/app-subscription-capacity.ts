import type { FireuxAppSubscriptionCapacity } from '../../../config/app/types'
import type { AppUserSubscription } from '../models/app-user.model'

export function appSubscriptionCapacity(
  capacity: FireuxAppSubscriptionCapacity,
  capability: string,
  subscription: AppUserSubscription
) {
  return capacity[capability]?.[subscription] ?? 0
}

export function hasAppSubscriptionCapacity(
  capacity: FireuxAppSubscriptionCapacity,
  capability: string,
  subscription: AppUserSubscription,
  count: number
) {
  const limit = appSubscriptionCapacity(capacity, capability, subscription)
  return limit === null || count < limit
}
