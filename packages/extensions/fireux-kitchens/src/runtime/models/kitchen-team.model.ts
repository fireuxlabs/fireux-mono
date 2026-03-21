// FILE: packages/extensions/fireux-kitchens/src/runtime/models/kitchen-team.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: console-owned operational record
 * Path: /kitchens/<kitchenId>/team/<memberId>
 * Owner console: Kitchen
 *
 * Decision note:
 * - Team membership is operational kitchen state even when it links back to root user or chef identities.
 * - Keep the ownership explicit: the kitchen owns the team record.
 * - If that changes later, update the models README first, then this file.
 */
export type KitchenTeamRole =
  | 'head_chef'
  | 'sous_chef'
  | 'line_cook'
  | 'prep_cook'
  | 'dishwasher'
  | 'runner'
  | 'manager'
  | 'other'

export type KitchenTeamStatus = 'active' | 'inactive'

export const KitchenTeamMember = {
  id: '' as string,
  kitchen_id: '' as string,

  // Optional links to existing profile/user records.
  user_id: '' as string,
  chef_profile_id: '' as string,

  display_name: '' as string,
  role: 'other' as KitchenTeamRole,
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
  [K in keyof typeof KitchenTeamMember]: (typeof KitchenTeamMember)[K]
}

export type KitchenTeamMemberCreateInput = Omit<
  KitchenTeamMember,
  'created' | 'updated'
>
export type KitchenTeamMemberUpdateInput = Partial<
  Omit<KitchenTeamMemberCreateInput, 'id' | 'kitchen_id'>
>

