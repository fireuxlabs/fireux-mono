// packages/core/fireux-core/src/runtime/models/core/appUser.model.ts
import type { FirebaseTimestamp } from '../../types/firebase'

/**
 * Tenant-scoped AppUser
 * - Minimal per-app state; app context is implied by path (apps/{appId}/users/{id}).
 * - Identity fields are duplicated for display convenience to avoid extra joins.
 */
export interface AppUser {
  /** Canonical user id (== Firebase Auth UID and CoreUser.id) */
  id: string

  /** Tenant role */
  role: 'user' | 'admin'

  /** App-enabled subset of global profile badges */
  profiles?: string[] // e.g. ['chef'] if enabled in this app

  /** Identity fields (duplicated for display convenience) */
  display_name: string
  email?: string
  avatar?: string
  handle?: string

  /** Timestamps */
  created_at: string | Date | FirebaseTimestamp
  updated_at?: string | Date | FirebaseTimestamp
}

/** UI views (flat props for components) */
export interface AppUserPillProps {
  id: string
  display_name: string
  avatar?: string
  role?: AppUser['role']
}

export interface AppUserCellProps extends AppUserPillProps {
  profiles?: string[]
}

export interface AppUserProfileProps extends AppUserCellProps {
  handle?: string
  created_at: AppUser['created_at']
  updated_at?: AppUser['updated_at']
}

/** Input / Update (optional but useful for writers) */
export type AppUserInput = Omit<AppUser, 'created_at' | 'updated_at'>
export type AppUserUpdate = Partial<
  Omit<AppUser, 'id' | 'created_at' | 'updated_at'>
>

/**
 * Back-compat aliases for existing imports (AppUser.Card.*)
 * Map legacy names to the new flat prop interfaces.
 */
export namespace AppUser {
  export namespace Card {
    export type Pill = AppUserPillProps
    export type Cell = AppUserCellProps
    export type Profile = AppUserProfileProps
  }
}
