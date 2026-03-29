// FILE: packages/core/fireux-core/src/runtime/models/core/user.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './meta.model'
import type { UserNotification } from './supporting/user'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Identity
 * Storage: root canonical record plus app overlay
 * Root path: /users/<userId>
 * Overlay path: /apps/<appId>/users/<userId>
 *
 * Decision note:
 * - User identity is global first, with app-scoped stored truth only where operational state is genuinely app-specific.
 * - AppUser is a real stored overlay, not just a console facade.
 * - If the identity overlay rule changes later, update the models README first, then this file.
 */

export const UserModel = {
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

export type User = {
  [K in keyof typeof UserModel]: (typeof UserModel)[K]
}

/**
 * App-specific user membership overlay.
 */
export const AppUserModel = {
  id: '',

  role: 'user' as 'user' | 'admin',
  is_premium: false,
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

export type AppUser = {
  [K in keyof typeof AppUserModel]: (typeof AppUserModel)[K]
}

export type UserCreateInput = Omit<User, 'id' | 'created' | 'updated'>
export type UserUpdateInput = Partial<Omit<User, 'id' | 'created' | 'updated'>>
