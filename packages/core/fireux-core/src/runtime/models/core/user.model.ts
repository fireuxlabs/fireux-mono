import type { FirebaseTimestamp } from '../../types/firebase.ts'
import type { Pill as PillModel } from '../../types/pill.model.ts'

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
  export interface MembershipBadge {
    id: string
    label: string
    isAdmin: boolean
  }

  export interface Pill extends PillModel.Props {
    memberships?: MembershipBadge[]
  }

  /** Cell extends Pill props + adds 'to' and domain fields */
  export interface Cell extends Pill {
    to?: string | null
    id: string
    profiles?: string[]
    role?: string
    handle?: string
    email?: string
    adminOf?: string[]
    userOf?: string[]
    createdAt?: FirebaseTimestamp
    updatedAt?: FirebaseTimestamp
    appUser?: AppUser | null
    runtime?: {
      mode: 'global' | 'tenant'
      appId?: string | null
    }
  }

  /** Profile = Cell with extra descriptive metadata */
  export interface Profile extends Cell {
    displayName?: string
    display_name?: string
    email?: string
    bio?: string
    created_at?: FirebaseTimestamp
    updated_at?: FirebaseTimestamp
  }
}
