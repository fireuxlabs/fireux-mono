// FILE: packages/extensions/fireux-kitchens/src/runtime/models/kitchen/team.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type KitchenTeamStatus = 'active' | 'inactive'
export type KitchenTeamJoinRequestStatus = 'pending' | 'approved' | 'rejected'

export interface KitchenTeamMember extends FireuxStamped {
  id: string
  kitchen_id: string
  user_id: string
  chef_profile_id: string
  name: string
  slug: string
  display_name: string
  role: string
  station_ids: string[]
  active: boolean
  sort_order: number
  status: KitchenTeamStatus
  station: string
  shift_label: string
  hourly_rate: number
  currency: string
  certifications: string[]
  notes: string
}

export interface KitchenTeamJoinRequest extends FireuxStamped {
  id: string
  kitchen_id: string
  user_id: string
  name: string
  message: string
  status: KitchenTeamJoinRequestStatus
}

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: scoped operational record
 * Path: /apps/<appId>/kitchens/<kitchenId>/team/<memberId>
 * Owner: Kitchen through its same-id AppKitchen support record
 *
 * Decision note:
 * - Team membership is operational kitchen state even when it links back to root user or chef identities.
 * - Keep the ownership explicit: the kitchen owns the team record.
 * - If that changes later, update the models README first, then this file.
 */
export const KitchenTeamMemberStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/team/{memberId}',
  collection: 'team',
  parent: 'kitchen',
  idParam: 'memberId',
} as const

export const KitchenTeamJoinRequestStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/team-join-requests/{requestId}',
  collection: 'team-join-requests',
  parent: 'kitchen',
  idParam: 'requestId',
} as const

export const KitchenTeamMemberRecord = defineFireuxEntity({
  kind: 'record',
  name: 'KitchenTeamMember',
  family: ['kitchen', 'support'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'none',
  console: false,
  parent: 'Kitchen',
  scoped: KitchenTeamMemberStorage.path,
  notes: [
    'Kitchen owns operational team state.',
    'A member may reference a User or ChefProfile but never grants Console authority.',
  ],
})

export const KitchenTeamJoinRequestRecord = defineFireuxEntity({
  kind: 'record',
  name: 'KitchenTeamJoinRequest',
  family: ['kitchen', 'support'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'none',
  console: false,
  parent: 'Kitchen',
  scoped: KitchenTeamJoinRequestStorage.path,
  notes: [
    'A join request is workflow state, not membership or access authority.',
  ],
})

export const KitchenTeamMemberDefaults = {
  id: '' as string,
  kitchen_id: '' as string,

  // Optional future links to existing profile/user records. Demo/test team records stay fake/manual.
  user_id: '' as string,
  chef_profile_id: '' as string,

  name: '' as string,
  slug: '' as string,
  display_name: '' as string,
  role: '' as string,
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

  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
  },
} as const satisfies KitchenTeamMember

export type KitchenTeamMemberCreateInput = Omit<
  KitchenTeamMember,
  'created' | 'updated'
>
export const KitchenTeamJoinRequestDefaults = {
  id: '' as string,
  kitchen_id: '' as string,

  user_id: '' as string,
  name: '' as string,
  message: '' as string,
  status: 'pending' as KitchenTeamJoinRequestStatus,

  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
  },
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
