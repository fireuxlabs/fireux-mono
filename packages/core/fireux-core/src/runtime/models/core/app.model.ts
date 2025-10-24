// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts
import type { FirestoreTimestampOrString } from '../../types/firebase.ts'

export type AppRole = 'global' | 'tenant' | 'sandbox'
type TimestampValue = FirestoreTimestampOrString

export interface App {
  /** == Firestore doc id */
  id: string

  /** Display name */
  app_name: string

  /** Optional short name used in UI badges */
  app_short_name?: string

  /** Scope + lineage */
  role: AppRole
  ecosystem: string

  /** Governance */
  admin_ids?: string[]
  creator_id: string

  /** Optional metadata */
  description?: string | null
  social_links?: Record<string, string> | null

  /** System metadata */
  created_at?: TimestampValue
  updated_at?: TimestampValue

  /** Brand/media URLs (flat) */
  avatar_url?: string | null
  logo_url?: string | null
  wordmark_url?: string | null
}

/* ---------------------------
 * UI Card View Models
 * --------------------------- */
export namespace AppCard {
  export interface Pill {
    id: string
    app_name: string
    avatar_url?: string | null
  }

  export interface Cell {
    id: string
    app_name: string
    role: AppRole
    admin_ids?: string[]
    creator_id: string
    created_at?: TimestampValue
    avatar_url?: string | null
    logo_url?: string | null
    wordmark_url?: string | null
  }

  export interface Profile {
    id: string
    app_name: string
    role: AppRole
    admin_ids?: string[]
    creator_id: string
    created_at?: TimestampValue
    avatar_url?: string | null
    logo_url?: string | null
    wordmark_url?: string | null
  }
}
