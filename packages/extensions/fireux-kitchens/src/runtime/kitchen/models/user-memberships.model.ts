import type {
  AppUserOnboardingStatus,
  AppUserRole,
  AppUserSubscription,
} from 'fireux-core/runtime/app/models/app-user.model'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Kitchen } from './kitchen.model.ts'
import type {
  KitchenTeamStatus,
  KitchenTeamMember,
} from '../utils/team-record'

export type KitchenUserTeamState =
  | 'active'
  | 'inactive'
  | 'missing'
  | 'invalid'

export type KitchenUserTeamAccess = Pick<
  KitchenTeamMember,
  'role' | 'status'
>

export type KitchenUserMembershipItem = {
  kitchen_id: string
  primary: boolean
  kitchen: Kitchen | null
  place: Place | null
  team: KitchenUserTeamAccess | null
  team_state: KitchenUserTeamState
}

export type KitchenUserAppMembership = {
  role: AppUserRole
  subscription: AppUserSubscription
  onboarding_status: AppUserOnboardingStatus
  primary_kitchen_id: string
  kitchen_ids: string[]
}

export type KitchenUserMembershipsResponse = {
  ok: true
  user_id: string
  app_user: KitchenUserAppMembership
  items: KitchenUserMembershipItem[]
}

