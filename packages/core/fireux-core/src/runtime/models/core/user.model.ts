// FILE: packages/core/fireux-core/src/runtime/models/core/user.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './meta.model'
import type { UserNotification } from './supporting/user'

/**
 * Entity map: docs/concepts/entities.md
 *
 * Family: Identity
 * Storage: public identity, private account, and app membership records
 * Public path: /users/<userId>
 * Private path: /users/<userId>/private/account
 * App path: /apps/<appId>/users/<userId>
 *
 * Decision note:
 * - User is public global identity. Its handle is its canonical route slug.
 * - UserPrivate contains private account data and signup agreement evidence.
 * - UserApp contains app membership, capability, notifications, and presentation state.
 * - UserApp is not a public profile overlay and does not use FireuxAppScope.
 */

export const UserStorage = {
  shape: 'root',
  path: 'users/{userId}',
  rootCollection: 'users',
  idParam: 'userId',
} as const

export const UserPrivateStorage = {
  shape: 'scoped',
  path: 'users/{userId}/private/account',
  collection: 'private',
  document: 'account',
  parent: 'user',
  idParam: 'userId',
} as const

export const UserAppStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/users/{userId}',
  collection: 'users',
  parent: 'app',
  idParam: 'userId',
} as const

export const UserAppConsoleTargetFields = {
  kitchen: 'kitchen_ids',
  supplier: 'supplier_ids',
  property: 'property_ids',
  portfolio: 'portfolio_ids',
  blank: 'blank_ids',
} as const

export type UserAppConsoleTargetField =
  (typeof UserAppConsoleTargetFields)[keyof typeof UserAppConsoleTargetFields]

export type UserAppConsoleTargets = Record<UserAppConsoleTargetField, string[]> &
  Record<string, string[]>

export const UserAppConsoleTargetsModel = {
  kitchen_ids: [] as string[],
  supplier_ids: [] as string[],
  property_ids: [] as string[],
  portfolio_ids: [] as string[],
  blank_ids: [] as string[],
} satisfies Record<UserAppConsoleTargetField, string[]>

export function resolveUserAppConsoleTargetField(family: unknown): string {
  const key = String(family ?? '').trim().toLowerCase()
  if (!key) return ''

  return (UserAppConsoleTargetFields as Record<string, string>)[key] || ''
}

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
  app_ids: [] as string[],
  profiles: [] as string[],

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
  app_ids: string[]
  profiles: string[]
  created: typeof UserModel.created
  updated: typeof UserModel.updated
}

/**
 * Private account data. This record must never be served by public user APIs.
 */
export const UserPrivateModel = {
  id: '',

  email: '',
  terms: {
    version: '',
    accepted_at: {} as FirebaseTimestamp,
  },

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export interface UserPrivate {
  id: string
  email: string
  terms: {
    version: string
    accepted_at: FirebaseTimestamp
  }
  created: typeof UserPrivateModel.created
  updated: typeof UserPrivateModel.updated
}

/**
 * App-specific membership and capability record.
 */
export const UserAppModel = {
  id: '',

  role: 'user' as 'user' | 'admin',
  is_premium: false,
  console_enabled: false,
  console_targets: UserAppConsoleTargetsModel as UserAppConsoleTargets,
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

export interface UserApp {
  id: string
  role: 'user' | 'admin'
  is_premium: boolean
  console_enabled: boolean
  console_targets: UserAppConsoleTargets
  notifications: UserNotification[]
  created: typeof UserAppModel.created
  updated: typeof UserAppModel.updated
}

export type UserCreateInput = Omit<User, 'id' | 'created' | 'updated'>
export type UserUpdateInput = Partial<Omit<User, 'id' | 'created' | 'updated'>>
export type UserPrivateCreateInput = Omit<UserPrivate, 'id' | 'created' | 'updated'>
export type UserPrivateUpdateInput = Partial<
  Omit<UserPrivate, 'id' | 'created' | 'updated'>
>
export type UserAppCreateInput = Omit<UserApp, 'id' | 'created' | 'updated'>
export type UserAppUpdateInput = Partial<Omit<UserApp, 'id' | 'created' | 'updated'>>
