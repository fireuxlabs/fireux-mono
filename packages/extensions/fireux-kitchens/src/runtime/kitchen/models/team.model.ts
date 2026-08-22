import type {
  FireuxWorkspaceTeamMember,
  FireuxWorkspaceTeamRequest,
  FireuxWorkspaceTeamRequestStatus,
  FireuxWorkspaceTeamStatus,
} from 'fireux-core/runtime/models/utils/workspace-entity.model'

export type KitchenTeamStatus = FireuxWorkspaceTeamStatus
export type KitchenTeamJoinRequestStatus = FireuxWorkspaceTeamRequestStatus

export type KitchenTeamMember = FireuxWorkspaceTeamMember & {
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
