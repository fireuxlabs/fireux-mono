// FILE: packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/team.ts

import type { AppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import type { FireuxAppSubscriptionCapacity } from 'fireux-core/config/app/types'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
export function kitchenTeamMemberLimit(
  capacity: FireuxAppSubscriptionCapacity,
  subscription: AppUserSubscription
) {
  return appSubscriptionCapacity(capacity, 'kitchen.team', subscription)
}

export function canAddKitchenTeamMember(
  capacity: FireuxAppSubscriptionCapacity,
  subscription: AppUserSubscription,
  memberCount: number
) {
  return hasAppSubscriptionCapacity(
    capacity,
    'kitchen.team',
    subscription,
    memberCount
  )
}
