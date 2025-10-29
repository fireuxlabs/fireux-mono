// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts
import type { FirestoreTimestampOrString } from '../../types/firebase.ts'
import type { Pill as PillModel } from '../../types/pill.model.ts'

export type AppRole = 'global' | 'tenant' | 'sandbox'
export type AppStatus = 'active' | 'archived'
type Ts = FirestoreTimestampOrString

export type AppPillProps = PillModel.Props & { to: string }
export type AppToPillMapper = (app: App) => AppPillProps

export interface App {
  /** == Firestore doc id */
  id: string

  /** Display */
  app_name: string
  app_short_name?: string
  slug?: string

  /** Scope + lineage */
  role: AppRole
  ecosystem: string

  /** Governance */
  join_requests?: string[]
  admin_ids?: string[]
  // Optional future-proof alternative:
  // roles?: Record<string, 'owner' | 'admin' | 'editor' | 'viewer'>
  creator_id: string

  /** Ops */
  status?: AppStatus

  /** Optional metadata */
  description?: string | null
  social_links?: Partial<
    Record<'site' | 'instagram' | 'facebook' | 'x' | 'linkedin', string | null>
  >

  /** System metadata */
  created_at: Ts // required – set via serverTimestamp on create
  updated_at?: Ts // set via serverTimestamp on update

  /** Brand/media URLs (flat) */
  avatar_url?: string | null
  logo_url?: string | null
  wordmark_url?: string | null
}

/* ---------------------------
 * UI Card View Models
 * --------------------------- */
export namespace AppCard {
  export interface Pill extends AppPillProps {
    id: string
    app_name: string
    avatar_url?: string | null
    ecosystem?: string
  }

  export interface Cell {
    id: string
    app_name: string
    role: AppRole
    creator_id: string
    admin_ids?: string[]
    created_at?: Ts
    avatar_url?: string | null
    logo_url?: string | null
    wordmark_url?: string | null
  }

  export interface Profile extends Cell {}
}
