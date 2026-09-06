// FILE: packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/team.ts

import { FireuxWorkspaceTeamRequestModel } from 'fireux-core/runtime/models/utils/workspace-entity.model'
import type { AppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import type { FireuxAppSubscriptionCapacity } from 'fireux-core/config/app/types'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import type {
  FireuxWorkspaceTeamRequest,
  FireuxWorkspaceTeamRequestStatus,
} from 'fireux-core/runtime/models/utils/workspace-entity.model'
export type KitchenTeamJoinRequest = FireuxWorkspaceTeamRequest & {
  id: string
  kitchen_id: string
  name: string
}

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

export const KitchenTeamMemberStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/team/{memberId}',
  collection: 'team',
  parent: 'kitchen',
  idParam: 'memberId',
} as const

export const KitchenTeamJoinRequestStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/team-requests/{requestId}',
  collection: 'team-requests',
  parent: 'kitchen',
  idParam: 'requestId',
} as const

export const KitchenTeamJoinRequestDefaults = {
  ...FireuxWorkspaceTeamRequestModel,
  id: '' as string,
  kitchen_id: '' as string,

  user_id: '' as string,
  name: '' as string,
  status: 'pending' as FireuxWorkspaceTeamRequestStatus,
} as const satisfies KitchenTeamJoinRequest

export type KitchenTeamJoinRequestCreateInput = Omit<
  KitchenTeamJoinRequest,
  'created' | 'updated'
>
export type KitchenTeamJoinRequestUpdateInput = Partial<
  Omit<
    KitchenTeamJoinRequest,
    'id' | 'created' | 'updated' | 'kitchen_id' | 'user_id'
  >
>
