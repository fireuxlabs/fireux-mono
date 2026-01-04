import type { FirestoreTimestampOrString } from '../../../types/firebase'

export type NotificationScope = 'ecosystem' | 'app'

type Ts = FirestoreTimestampOrString

export interface UserNotification {
  message: string
  scope: NotificationScope
  created_at: string
  read: boolean
  app_id?: string
}

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
}

/**
 * App-specific user overlay
 * Path: /apps/<appId>/users/<userId>
 */
export interface AppUser {
  id: string

  role: 'user' | 'admin'

  creator_id: string

  created_at: Ts
  updated_at: Ts
}
