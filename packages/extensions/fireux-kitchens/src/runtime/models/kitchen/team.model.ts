// FILE: packages/extensions/fireux-kitchens/src/runtime/models/kitchen/team.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/utils/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: scoped operational record
 * Path: /kitchens/<kitchenId>/team/<memberId>
 * Owner app scope: Kitchen
 *
 * Decision note:
 * - Team membership is operational kitchen state even when it links back to root user or chef identities.
 * - Keep the ownership explicit: the kitchen owns the team record.
 * - If that changes later, update the models README first, then this file.
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
  path: 'kitchens/{kitchenId}/team-join-requests/{requestId}',
  collection: 'team-join-requests',
  parent: 'kitchen',
  idParam: 'requestId',
} as const

export type KitchenTeamStatus = 'active' | 'inactive'
export type KitchenTeamJoinRequestStatus = 'pending' | 'approved' | 'rejected'

export const KitchenTeamMemberModel = {
  id: '' as string,
  kitchen_id: '' as string,

  // Optional future links to existing profile/user records. Demo/test team records stay fake/manual.
  user_id: '' as string,
  chef_profile_id: '' as string,

  name: '' as string,
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
} as const

export type KitchenTeamMember = {
  [K in keyof typeof KitchenTeamMemberModel]: (typeof KitchenTeamMemberModel)[K]
}

export type KitchenTeamMemberCreateInput = Omit<KitchenTeamMember, 'created' | 'updated'>
export type KitchenTeamMemberUpdateInput = Partial<
  Omit<KitchenTeamMember, 'id' | 'created' | 'updated' | 'kitchen_id'>
>

export const KitchenTeamJoinRequestModel = {
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
} as const

export type KitchenTeamJoinRequest = {
  [K in keyof typeof KitchenTeamJoinRequestModel]: (typeof KitchenTeamJoinRequestModel)[K]
}
