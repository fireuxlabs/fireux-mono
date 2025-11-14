import type { FirebaseTimestamp } from '../../types/firebase.ts'
import type { Pill as PillModel } from '../../types/pill.model.ts'

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
}

/** Minimal tenant overlay for user */
export interface AppUser {
  id: string
  role: 'user' | 'admin'
  creator_id: string
  created_at: FirebaseTimestamp
  updated_at?: FirebaseTimestamp
}

/* ---------------------------
 * UI View Models (purely structural)
 * --------------------------- */
export namespace UserCard {
  export interface Pill extends PillModel.Props {}

  /** Cell extends Pill props + adds 'to' and domain fields */
  export interface Cell extends Pill {
    to: string
    id: string
    profiles?: string[]
    role?: string
    adminOf?: string[]
    userOf?: string[]
  }

  /** Profile = Cell with extra descriptive metadata */
  export interface Profile extends Cell {
    email?: string
    bio?: string
    created_at?: FirebaseTimestamp
    updated_at?: FirebaseTimestamp
  }
}
