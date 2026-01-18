// FILE: packages/core/fireux-core/src/runtime/models/core/user.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './meta.model'
import type { UserNotification } from './user.supporting'

/**
 * Core Firestore user document
 * Path: /users/<userId>
 *
 * Canon rules:
 * - No optional strings
 * - Empty string means unset
 * - Arrays always exist
 * - Runtime object is the single source of truth
 */

export type UserShape = FireuxStamped & {
  id: string
  display_name: string
  avatar: string
  handle: string
  email: string
  bio: string
  profiles: string[]
  userOf: string[]
  adminOf: string[]
  notifications: UserNotification[]
}

// Runtime canonical shape
export const User = {
  id: '',

  display_name: '',
  avatar: '',

  handle: '',
  email: '',
  bio: '',

  profiles: [] as string[],

  userOf: [] as string[],
  adminOf: [] as string[],

  notifications: [] as UserNotification[],

  // Authored (FireuxStamped)
  creator_id: undefined,
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} satisfies UserShape & Record<string, unknown>

// Type derived from runtime model
export interface User extends UserShape {}

/**
 * App-specific user overlay
 * Path: /apps/<appId>/users/<userId>
 */
export type AppUserShape = FireuxStamped & {
  id: string
  role: 'user' | 'admin'
  notifications: UserNotification[]
}

export const AppUser = {
  id: '',
  role: 'user' as 'user' | 'admin',
  notifications: [] as UserNotification[],
  creator_id: undefined,
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} satisfies AppUserShape & Record<string, unknown>

export interface AppUser extends AppUserShape {}
