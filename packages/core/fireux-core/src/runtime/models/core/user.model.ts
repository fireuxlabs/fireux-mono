// FILE: packages/core/fireux-core/src/runtime/models/core/user.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './meta.model'
import type { UserNotification } from './supporting/user'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Identity
 * Storage: root canonical record plus app overlay record
 * Root path: /users/<userId>
 * App path: /apps/<appId>/users/<userId>
 *
 * Decision note:
 * - User identity is global first; the root user is the default truth.
 * - AppUser is an overlay for app membership, capability, notifications, and presentation state.
 * - Identity overlays do not use FireuxAppScope because they are not root-plus-app operational targets.
 * - If the identity overlay rule changes later, update the models README first, then this file.
 */

export const UserStorage = {
  shape: 'both',
  root: 'users/{userId}',
  overlay: 'apps/{appId}/users/{userId}',
  rootCollection: 'users',
  overlayCollection: 'users',
  idParam: 'userId',
} as const

export const AppUserStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/users/{userId}',
  collection: 'users',
  parent: 'app',
  idParam: 'userId',
} as const

export const UserNotificationStorage = {
  shape: 'scoped',
  path: 'users/{userId}/notifications/{notificationId}',
  collection: 'notifications',
  parent: 'user',
  idParam: 'notificationId',
} as const

export const UserModel = {
  id: '',

  display_name: '',
  avatar: '',
  handle: '',
  email: '',
  bio: '',
  profiles: [] as string[],
  projects: [] as string[],
  userOf: [] as string[],
  adminOf: [] as string[],
  notifications: [] as UserNotification[],

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export interface User {
  id: string
  display_name: string
  avatar: string
  handle: string
  email: string
  bio: string
  profiles: string[]
  projects: string[]
  userOf: string[]
  adminOf: string[]
  notifications: UserNotification[]
  created: typeof UserModel.created
  updated: typeof UserModel.updated
}

/**
 * App-specific user overlay.
 */
export const AppUserModel = {
  id: '',

  role: 'user' as 'user' | 'admin',
  is_premium: false,
  console_enabled: false,
  console_scopes: [] as string[],
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

export interface AppUser {
  id: string
  role: 'user' | 'admin'
  is_premium: boolean
  console_enabled: boolean
  console_scopes: string[]
  notifications: UserNotification[]
  created: typeof AppUserModel.created
  updated: typeof AppUserModel.updated
}

export type UserCreateInput = Omit<User, 'id' | 'created' | 'updated'>
export type UserUpdateInput = Partial<Omit<User, 'id' | 'created' | 'updated'>>
