// FILE: packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/team.ts

import {
  FireuxWorkspaceTeamMemberModel,
  FireuxWorkspaceTeamRequestModel,
} from 'fireux-core/runtime/models/utils/workspace-entity.model'
import type { AppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import type { FireuxAppSubscriptionCapacity } from 'fireux-core/config/app/types'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import type {
  KitchenTeamJoinRequest,
  KitchenTeamJoinRequestStatus,
  KitchenTeamMember,
  KitchenTeamStatus,
} from './team-record'

export type {
  KitchenTeamJoinRequest,
  KitchenTeamJoinRequestStatus,
  KitchenTeamMember,
  KitchenTeamStatus,
} from './team-record'

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
 *   and user_id both equal that User uid and the status is active.
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
  ...FireuxWorkspaceTeamMemberModel,
  id: '' as string,
  kitchen_id: '' as string,

  // Optional future links to existing profile/user records. Demo/test team records stay fake/manual.
  user_id: '' as string,
  chef_profile_id: '' as string,

  name: '' as string,
  slug: '' as string,
  display_name: '' as string,
  role_ids: [] as string[],
  job_title: '' as string,
  station_ids: [] as string[],
  active: true as boolean,
  sort_order: 0 as number,
  status: 'active' as KitchenTeamStatus,
  station: '' as string,
  shift_label: '' as string,

  hourly_rate: 0 as number,
  currency: 'CHF' as string,
  certifications: [] as string[],
  notes: '' as string,
} as const satisfies KitchenTeamMember

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
