// FILE: packages/extensions/fireux-kitchens/src/runtime/kitchen/models/team.model.ts

import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import {
  FireuxWorkspaceTeamMemberModel,
  FireuxWorkspaceTeamRequestModel,
  type FireuxWorkspaceTeamMember,
  type FireuxWorkspaceTeamRequest,
  type FireuxWorkspaceTeamRequestStatus,
  type FireuxWorkspaceTeamStatus,
} from 'fireux-core/runtime/models/utils/workspace-entity.model'

export type KitchenTeamStatus = FireuxWorkspaceTeamStatus
export type KitchenTeamJoinRequestStatus = FireuxWorkspaceTeamRequestStatus

export interface KitchenTeamMember extends FireuxWorkspaceTeamMember {
  id: string
  kitchen_id: string
  chef_profile_id: string
  name: string
  slug: string
  display_name: string
  job_title: string
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

export interface KitchenTeamJoinRequest extends FireuxWorkspaceTeamRequest {
  id: string
  kitchen_id: string
  name: string
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

export const KitchenTeamMemberRecord = defineFireuxEntity({
  kind: 'record',
  name: 'KitchenTeamMember',
  family: ['kitchen', 'support'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  workspace: false,
  parent: 'Kitchen',
  scoped: KitchenTeamMemberStorage.path,
  notes: [
    'Kitchen owns Team state and exact active linked records grant Workspace authority.',
    'An unlinked named member grants no access.',
  ],
})

export const KitchenTeamJoinRequestRecord = defineFireuxEntity({
  kind: 'record',
  name: 'KitchenTeamJoinRequest',
  family: ['kitchen', 'support'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  workspace: false,
  parent: 'Kitchen',
  scoped: KitchenTeamJoinRequestStorage.path,
  notes: [
    'A join request is workflow state, not membership or access authority.',
  ],
})

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
