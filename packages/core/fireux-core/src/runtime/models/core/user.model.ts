// FILE: packages/core/fireux-core/src/runtime/models/core/user.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { UserNotification } from './user.supporting'

/**
 * Core Firestore user document
 * Path: /users/<userId>
 */
export interface User {
  id: string

  display_name: string
  avatar: string

  handle: string
  email: string
  bio: string
  
  profiles: string[]

  /** Core memberships */
  userOf: string[]
  adminOf: string[]

  // notifications (safe to store; interfaces decide what to render)
  notifications: UserNotification[]

  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

// Canonical shape keys for runtime validation.
// NOTE: This is intentionally co-located with the model to prevent drift.
export const USER_MODEL_KEYS = [
  'id',
  'display_name',
  'avatar',
  'handle',
  'email',
  'bio',
  'profiles',
  'userOf',
  'adminOf',
  'notifications',
  'created_at',
  'updated_at',
] as const satisfies readonly (keyof User)[]

export const USER_MODEL_REQUIRED_KEYS = [
  'id',
  'display_name',
  'avatar',
  'handle',
  'email',
  'bio',
  'profiles',
  'userOf',
  'adminOf',
  'notifications',
  'created_at',
  'updated_at',
] as const satisfies readonly (keyof User)[]

/**
 * App-specific user overlay
 * Path: /apps/<appId>/users/<userId>
 */
export interface AppUser {
  id: string

  role: 'user' | 'admin'

  creator_id: string

  notifications: UserNotification[]

  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}
