// FILE: packages/core/fireux-core/src/runtime/models/core/user.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { UserNotification } from './user.supporting'
import type { FireuxAuthored } from './meta.model'

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

export type UserShape = FireuxAuthored & {
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
export const User: UserShape = {
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

  // Authored (FireuxAuthored)
  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

// Type derived from runtime model
export interface User extends UserShape {}

/**
 * App-specific user overlay
 * Path: /apps/<appId>/users/<userId>
 */
export type AppUserShape = {
  id: string
  role: 'user' | 'admin'
  creator_id: string
  notifications: UserNotification[]
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

export const AppUser: AppUserShape = {
  id: '',
  role: 'user' as 'user' | 'admin',
  creator_id: '',
  notifications: [] as UserNotification[],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export interface AppUser extends AppUserShape {}
