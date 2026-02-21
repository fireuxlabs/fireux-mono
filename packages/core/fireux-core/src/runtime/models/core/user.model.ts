// FILE: packages/core/fireux-core/src/runtime/models/core/user.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './meta.model'
import type { UserNotification } from './user.supporting'

/**
 * Core Firestore user document
 * Path: /users/<userId>
 *
 * Canon rules:
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
  handle_normalized: '',
  email: '',
  bio: '',

  profiles: [] as string[],

  userOf: [] as string[],
  adminOf: [] as string[],

  notifications: [] as UserNotification[],

  // Authored (FireuxStamped)
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type User = {
  [K in keyof typeof User]: (typeof User)[K]
}

/**
 * App-specific user overlay
 * Path: /apps/<appId>/users/<userId>
 */
export const AppUser = {
  id: '',
  role: 'user' as 'user' | 'admin',
  notifications: [] as UserNotification[],
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type AppUser = {
  [K in keyof typeof AppUser]: (typeof AppUser)[K]
}
