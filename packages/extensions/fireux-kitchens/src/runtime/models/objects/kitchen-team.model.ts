// FILE: packages/extensions/fireux-kitchens/src/runtime/models/objects/kitchen-team.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Kitchen Team Member (canonical Firestore shape)
 * Firestore: kitchens/{kitchenId}/team/{memberId}
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

  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type KitchenTeamMember = {
  [K in keyof typeof KitchenTeamMember]: (typeof KitchenTeamMember)[K]
}

export type KitchenTeamMemberCreateInput = Omit<
  KitchenTeamMember,
  'app_id' | 'creator_id' | 'created_at' | 'updated_at'
>
export type KitchenTeamMemberUpdateInput = Partial<
  Omit<KitchenTeamMemberCreateInput, 'id' | 'kitchen_id'>
>

