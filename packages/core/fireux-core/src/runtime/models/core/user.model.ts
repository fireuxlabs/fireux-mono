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
