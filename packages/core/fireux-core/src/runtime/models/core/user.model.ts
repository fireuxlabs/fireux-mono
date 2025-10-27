// FILE: packages/core/fireux-core/src/runtime/models/core/user.model.ts
import type { FirebaseTimestamp } from '../../types/firebase'
import type { Pill as PillModel } from '../../types/pill.model'

/** ------------------------------------------------------------------
 *  BASE USER DOCUMENT (shared across core and app scopes)
 *  ------------------------------------------------------------------ */
export interface BaseUserDoc {
  id: string
  display_name: string
  avatar: string
  handle?: string
  email?: string
  bio?: string
  profiles?: string[]
  created_at: FirebaseTimestamp
  updated_at?: FirebaseTimestamp
}

/** ------------------------------------------------------------------
 *  CORE USER DOCUMENT
 *  Global identity and membership info
 *  ------------------------------------------------------------------ */
export interface CoreUserDoc extends BaseUserDoc {
  userOf: string[]
  adminOf: string[]
}

/** ------------------------------------------------------------------
 *  APP USER DOCUMENT
 *  App-specific role or overrides
 *  ------------------------------------------------------------------ */
export interface AppUserDoc extends BaseUserDoc {
  role: 'user' | 'admin'
}

/** ------------------------------------------------------------------
 *  UNIFIED USER
 *  Flattened runtime shape combining both scopes
 *  - No UI fallbacks here; this is a data shape.
 *  ------------------------------------------------------------------ */
export interface User {
  id: string
  display_name: string
  avatar: string
  handle?: string
  email?: string
  bio?: string
  profiles?: string[]
  role?: 'user' | 'admin'
  userOf?: string[]
  adminOf?: string[]
  core?: CoreUserDoc
  app?: AppUserDoc
}

/** ------------------------------------------------------------------
 *  UI SHAPES (aligned with Pill protocol)
 *  title    -> display_name
 *  subtitle -> handle
 *  badges   -> (optional, up to the view-model)
 *  ------------------------------------------------------------------ */

// Canonical Pill props that <MoleculesPill> expects
export type UserPillProps = PillModel.Props & { to: string }

// Type helper for typed mapping functions (used in composables)
export type UserToPillMapper = (u: User) => UserPillProps

export namespace UserCard {
  /** Minimal pill-ready shape */
  export interface Pill extends UserPillProps {
    id: string
    role?: 'user' | 'admin'
  }

  /** Cell extends the pill with optional extras for list rows */
  export interface Cell extends Pill {
    profiles?: string[]
  }

  /** Profile extends cell for detail panes */
  export interface Profile extends Cell {
    bio?: string
    email?: string
    created_at?: FirebaseTimestamp
    updated_at?: FirebaseTimestamp
  }
}

/** ------------------------------------------------------------------
 *  NOTES:
 *  - The `PillModel.Props` contract is shared across all Pill-like
 *    components in FireUX (User, App, Chef, etc.).
 *  - `UserToPillMapper` is used in composables to ensure a single,
 *    consistent mapping between the User model and UI components.
 *  - All view-models (UserCard.*, etc.) are purely structural and
 *    contain no fallbacks or computed formatting logic.
 *  ------------------------------------------------------------------ */
