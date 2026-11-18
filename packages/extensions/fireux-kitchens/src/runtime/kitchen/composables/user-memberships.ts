import type {
  AppUserRole,
  AppUserSubscription,
} from 'fireux-core/runtime/app/app-user/models/model'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { KitchenPublicSummary } from '../types/public'
import type { WorkspaceTeamMemberDocument } from 'fireux-core/runtime/workspace/models/team-member.model'

export type KitchenUserTeamState = 'linked' | 'missing' | 'invalid'

export type KitchenUserTeamAccess = Pick<WorkspaceTeamMemberDocument, 'user_id'>

export type KitchenUserMembershipItem = {
  kitchen_id: string
  kitchen: KitchenPublicSummary | null
  place: Place | null
  team: KitchenUserTeamAccess | null
  team_state: KitchenUserTeamState
}

export type KitchenUserAppMembership = {
  role: AppUserRole
  subscription: AppUserSubscription
}

export type KitchenUserMembershipsResponse = {
  ok: true
  user_id: string
  app_user: KitchenUserAppMembership
  items: KitchenUserMembershipItem[]
}
