// packages/core/fireux-core/src/runtime/models/core/appUser.model.ts
import type { FirebaseTimestamp } from '../../types/firebase'
import type { CoreUser } from './coreUser.model'

/**
 * Tenant-scoped AppUser
 * - Minimal per-app state; display identity comes from CoreUser.
 * - `id` equals the Firebase Auth UID and CoreUser.id.
 * - App context is implied by Firestore path (apps/{appId}/users/{id}).
 */
export interface AppUser {
  /** Canonical user id (== Firebase Auth UID and CoreUser.id) */
  id: string

  /** Tenant role */
  role: 'user' | 'admin'

  /** App-enabled subset of global profile badges */
  profiles?: string[] // e.g. ['chef'] if enabled in this app

  /** Timestamps */
  created_at: string | Date | FirebaseTimestamp
  updated_at?: string | Date | FirebaseTimestamp
}

/**
 * Helper type: AppUser decorated with Core identity for display.
 * Use this when building UI lists/cards to avoid duplicating identity on AppUser.
 */
export type AppUserWithCore<T = {}> = T & {
  core: Pick<CoreUser, 'display_name' | 'email' | 'avatar' | 'handle'>
}

export namespace AppUser {
  export namespace Card {
    // Minimal identity chip/pill for tenant views
    export type Pill = AppUserWithCore<{
      role?: AppUser['role']
    }>

    // Compact list/cell representation
    export type Cell = AppUserWithCore<{
      id: string
      role?: AppUser['role']
      created_at: AppUser['created_at']
    }>

    // Full profile card (tenant-scoped + core identity)
    export type Profile = AppUserWithCore<{
      id: string
      role: AppUser['role']
      profiles?: AppUser['profiles']
      created_at: AppUser['created_at']
      updated_at?: AppUser['updated_at']
    }>
  }
}
