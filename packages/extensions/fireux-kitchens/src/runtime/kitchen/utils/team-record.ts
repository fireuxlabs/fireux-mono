import type { KitchenTeamMember as KitchenTeamProfile } from '../models/team.model'

// Existing storage and access representation; not the editable person profile.
import type {
  FireuxWorkspaceTeamMember,
  FireuxWorkspaceTeamRequest,
  FireuxWorkspaceTeamRequestStatus,
  FireuxWorkspaceTeamStatus,
} from 'fireux-core/runtime/models/utils/workspace-entity.model'

export type KitchenTeamStatus = FireuxWorkspaceTeamStatus
export type KitchenTeamJoinRequestStatus = FireuxWorkspaceTeamRequestStatus

export type KitchenTeamMember = Omit<FireuxWorkspaceTeamMember, 'role'> &
  KitchenTeamProfile & {
    role: 'owner' | 'developer' | 'operator' | 'member'
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

export type KitchenTeamJoinRequest = FireuxWorkspaceTeamRequest & {
  id: string
  kitchen_id: string
  name: string
}
