// FILE: packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/team.ts

import { FireuxWorkspaceTeamRequestModel } from 'fireux-core/runtime/models/utils/workspace-entity.model'
import type { AppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import type { FireuxAppSubscriptionCapacity } from 'fireux-core/config/app/types'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import type { KitchenTeamMember as Profile } from '../models/team.model'
import type { FireuxWorkspaceTeamRequest, FireuxWorkspaceTeamRequestStatus } from 'fireux-core/runtime/models/utils/workspace-entity.model'
export type KitchenTeamMember = Profile & { id: string }
export type KitchenTeamJoinRequestStatus = FireuxWorkspaceTeamRequestStatus
export type KitchenTeamJoinRequest = FireuxWorkspaceTeamRequest & { id: string; kitchen_id: string; name: string }

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

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: scoped operational record
 * Path: /kitchens/<kitchenId>/team/<memberId>
 * Owner: Kitchen
 *
 * Decision note:
 * - A member linked to a User grants Workspace access only when its document id
 *   and user_id both equal that User uid.
 * - Unlinked named staff may remain operational Team records but grant no access.
 */
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

export const KitchenTeamMemberDefaults = {
  name: '',
  user_id: '',
  role_ids: [] as string[],
} satisfies Omit<KitchenTeamMember, 'id'>

export type KitchenTeamMemberCreateInput = Omit<
  KitchenTeamMember,
  'created' | 'updated'
>
export const KitchenTeamJoinRequestDefaults = {
  ...FireuxWorkspaceTeamRequestModel,
  id: '' as string,
  kitchen_id: '' as string,

  user_id: '' as string,
  name: '' as string,
  status: 'pending' as KitchenTeamJoinRequestStatus,
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
