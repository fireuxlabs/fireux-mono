// FILE: packages/core/fireux-core/src/runtime/models/core/user.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './meta.model'
import type { UserNotification } from './supporting/user'

/**
 * Entity Class: Dual-Layer
 * Core Path: /users/<userId>
 * App Path: /apps/<appId>/users/<userId>
 *
 * Canon rules:
 * - Empty string means unset
 * - Arrays always exist
 * - Runtime object is the single source of truth
 */

export interface UserCoreExtensions {}
export interface UserAppExtensions {}

export const UserCore = {
  id: '',

  display_name: '',
  avatar: '',
  handle: '',
  email: '',
  bio: '',
  profiles: [],
  userOf: [],
  adminOf: [],
  notifications: [],

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type UserCore = {
  [K in keyof typeof UserCore]: (typeof UserCore)[K]
} & UserCoreExtensions

/**
 * App-specific user membership overlay.
 */
export const UserApp = {
  id: '',

  role: 'user' as 'user' | 'admin',
  console_enabled: false,
  console_scopes: [],
  notifications: [] as UserNotification[],

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

export type UserApp = {
  [K in keyof typeof UserApp]: (typeof UserApp)[K]
} & UserAppExtensions

export type User = UserCore
export type AppUser = UserApp
export type UserResolved = UserCore & {
  appUser?: UserApp | null
}
export type UserCoreDoc = Omit<UserCore, 'id'>
export type UserAppDoc = Omit<UserApp, 'id'>
