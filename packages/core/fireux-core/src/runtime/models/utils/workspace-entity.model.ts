import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './stamps.model'

export const FireuxWorkspaceEntityVisibilityModel = {
  show: false as boolean,
  active: true as boolean,
  is_test: false as boolean,
} as const

export type FireuxWorkspaceEntityVisibility = {
  [K in keyof typeof FireuxWorkspaceEntityVisibilityModel]: (typeof FireuxWorkspaceEntityVisibilityModel)[K]
}

export const FireuxWorkspaceEntityIdentityModel = {
  display_name: '' as string,
  tagline: '' as string,
  image_url: '' as string,
  gallery: [] as string[],
} as const

export type FireuxWorkspaceEntityIdentity = {
  [K in keyof typeof FireuxWorkspaceEntityIdentityModel]: (typeof FireuxWorkspaceEntityIdentityModel)[K]
}

export type FireuxWorkspaceTeamStatus = 'active' | 'inactive'
export type FireuxWorkspaceTeamRole = 'owner' | 'operator' | 'member'

export const FireuxWorkspaceTeamMemberModel = {
  user_id: '' as string,
  role: 'member' as FireuxWorkspaceTeamRole,
  permissions: [] as string[],
  status: 'active' as FireuxWorkspaceTeamStatus,
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type FireuxWorkspaceTeamMember = {
  [K in keyof typeof FireuxWorkspaceTeamMemberModel]: (typeof FireuxWorkspaceTeamMemberModel)[K]
}

export type FireuxWorkspaceTeamRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'

export const FireuxWorkspaceTeamRequestModel = {
  user_id: '' as string,
  message: '' as string,
  status: 'pending' as FireuxWorkspaceTeamRequestStatus,
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type FireuxWorkspaceTeamRequest = {
  [K in keyof typeof FireuxWorkspaceTeamRequestModel]: (typeof FireuxWorkspaceTeamRequestModel)[K]
}
