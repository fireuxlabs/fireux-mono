// FILE: packages/core/fireux-core/src/runtime/models/core/user.model.ts
import type { FirebaseTimestamp } from '../../types/firebase'
import type { Pill } from '../../types/pill.model'

/** ------------------------------------------------------------------
 *  BASE USER DOCUMENT (shared across core and app scopes)
 *  ------------------------------------------------------------------ */
export interface BaseUserDoc {
  id: string
  display_name: string
  avatar: string
  handle?: string
  email?: string
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
export namespace UserCard {
  /** Minimal pill-ready shape */
  export interface Pill extends Pill.Props {
    id: string
    role?: 'user' | 'admin'
  }

  /** Cell extends the pill with optional extras for list rows */
  export interface Cell extends Pill {
    profiles?: string[]
  }

  /** Profile extends cell for detail panes */
  export interface Profile extends Cell {
    created_at?: FirebaseTimestamp
    updated_at?: FirebaseTimestamp
  }
}