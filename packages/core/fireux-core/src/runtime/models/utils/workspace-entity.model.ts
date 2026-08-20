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

export const FireuxWorkspaceAccessModel = {
  operator_ids: [] as string[],
} as const

export type FireuxWorkspaceAccess = {
  [K in keyof typeof FireuxWorkspaceAccessModel]: (typeof FireuxWorkspaceAccessModel)[K]
}

export const FireuxAppAccessRecordModel = {
  id: '' as string,
  ...FireuxWorkspaceAccessModel,
  team_ids: [] as string[],
  join_requests: [] as string[],
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

export type FireuxAppAccessRecord = {
  [K in keyof typeof FireuxAppAccessRecordModel]: (typeof FireuxAppAccessRecordModel)[K]
}
