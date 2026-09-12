import type {
  AppUserOnboardingStatus,
  AppUserRole,
  AppUserSubscription,
} from 'fireux-core/runtime/app/models/app-user.model'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Kitchen } from './kitchen.model.ts'
import type { WorkspaceTeamMemberDocument } from 'fireux-core/runtime/models/workspace-team-member.model'

export type KitchenUserTeamState = 'linked' | 'missing' | 'invalid'

export type KitchenUserTeamAccess = Pick<WorkspaceTeamMemberDocument, 'user_id'>

export type KitchenUserMembershipItem = {
  kitchen_id: string
  kitchen: Kitchen | null
  place: Place | null
  team: KitchenUserTeamAccess | null
  team_state: KitchenUserTeamState
}

export type KitchenUserAppMembership = {
  role: AppUserRole
  subscription: AppUserSubscription
  onboarding_status: AppUserOnboardingStatus
}

export type KitchenUserMembershipsResponse = {
  ok: true
  user_id: string
  app_user: KitchenUserAppMembership
  items: KitchenUserMembershipItem[]
}
