import type { FireuxAppSubscriptionCapacity } from '../../../config/app/types'
import type { AppUserSubscription } from '../records/app-user'
import { readAppUserSubscription } from './membership/validation.ts'

export function appSubscriptionCapacity(
  capacity: FireuxAppSubscriptionCapacity,
  capability: string,
  subscription: AppUserSubscription | 'premium'
) {
  const tier = readAppUserSubscription(subscription)
  const limit = tier ? capacity[capability]?.[tier] : undefined
  return limit === undefined ? 0 : limit
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
