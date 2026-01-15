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

  // Authored (FireuxAuthored)
  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

// Type derived from runtime model
export type User = FireuxAuthored & {
  [K in keyof typeof User]: (typeof User)[K]
}

/**
 * App-specific user overlay
 * Path: /apps/<appId>/users/<userId>
 */
export const AppUser = {
  id: '',
  role: 'user' as 'user' | 'admin',
  creator_id: '',
  notifications: [] as UserNotification[],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type AppUser = {
  [K in keyof typeof AppUser]: (typeof AppUser)[K]
}
