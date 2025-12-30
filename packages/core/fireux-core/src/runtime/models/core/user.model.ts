import type { FirebaseTimestamp } from '../../../types/firebase'
import type { CardPayload } from '../../types/card-payload'

export type NotificationScope = 'ecosystem' | 'app'

export interface UserNotification {
  id: string
  message: string
  scope: NotificationScope
  created_at: string
  read?: boolean
  app_id?: string
}

/** Core Firestore User document */
export interface User {
  id: string
  display_name: string
  avatar: string
  handle?: string
  email?: string
  bio?: string
  profiles?: string[]

  // System metadata
  created_at: FirebaseTimestamp
  updated_at?: FirebaseTimestamp

  // Core membership
  userOf?: string[]
  adminOf?: string[]

  // Optional overlay info (tenant)
  role?: 'user' | 'admin'
  appUser?: AppUser | null
  notifications?: UserNotification[]
}

/** Minimal tenant overlay for user */
export interface AppUser {
  id: string
  role: 'user' | 'admin'
  creator_id: string
  created_at: FirebaseTimestamp
  updated_at?: FirebaseTimestamp
  notifications?: UserNotification[]
}

/* ---------------------------
 * UI View Models (purely structural)
 * --------------------------- */
export namespace UserCard {
  /** Single payload powering all views (Pill/Cell/Preview/Profile). */
  export type Card = CardPayload
}
