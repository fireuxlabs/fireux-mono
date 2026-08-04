import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxAppScopeState } from './scope.model'
import type { FireuxStamped } from './stamps.model'

export const FireuxConsoleEntityAppScopeModel = {
  state: 'root_only' as FireuxAppScopeState,
  app_id: '' as string,
} as const

export type FireuxConsoleEntityAppScope = {
  [K in keyof typeof FireuxConsoleEntityAppScopeModel]: (typeof FireuxConsoleEntityAppScopeModel)[K]
}

export const FireuxConsoleEntityVisibilityModel = {
  show: false as boolean,
  active: true as boolean,
  is_test: false as boolean,
} as const

export type FireuxConsoleEntityVisibility = {
  [K in keyof typeof FireuxConsoleEntityVisibilityModel]: (typeof FireuxConsoleEntityVisibilityModel)[K]
}

export const FireuxConsoleEntityIdentityModel = {
  display_name: '' as string,
  tagline: '' as string,
  image_url: '' as string,
  gallery: [] as string[],
} as const

export type FireuxConsoleEntityIdentity = {
  [K in keyof typeof FireuxConsoleEntityIdentityModel]: (typeof FireuxConsoleEntityIdentityModel)[K]
}

export const FireuxConsoleAccessModel = {
  operator_ids: [] as string[],
} as const

export type FireuxConsoleAccess = {
  [K in keyof typeof FireuxConsoleAccessModel]: (typeof FireuxConsoleAccessModel)[K]
}

export const FireuxAppAccessRecordModel = {
  id: '' as string,
  ...FireuxConsoleAccessModel,
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
