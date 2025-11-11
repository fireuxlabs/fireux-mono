// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts
import type { FirestoreTimestampOrString } from '../../types/firebase.ts'
import type { Pill as PillModel } from '../../types/pill.model.ts'

export type AppRole = 'global' | 'tenant' | 'sandbox'
export type AppStatus = 'active' | 'archived'
type Ts = FirestoreTimestampOrString

/** Core Firestore App document */
export interface App {
  id: string

  // Display
  app_name: string
  app_short_name?: string
  slug?: string

  // Scope + lineage
  role: AppRole
  ecosystem: string

  // Governance
  join_requests?: string[]
  admin_ids?: string[]
  creator_id: string

  // Ops
  status?: AppStatus

  // Optional metadata
  description?: string | null
  social_links?: Partial<
    Record<'site' | 'instagram' | 'facebook' | 'x' | 'linkedin', string | null>
  >

  // System metadata
  created_at: Ts
  updated_at?: Ts

  // Brand/media URLs (flat)
  avatar_url?: string | null
  logo_url?: string | null
  wordmark_url?: string | null
}

/* ---------------------------
 * UI View Models (purely structural)
 * --------------------------- */
export namespace AppCard {
  export interface Pill extends PillModel.Props {}

  /** Cell extends Pill props + adds 'to' and domain fields */
  export interface Cell extends Pill {
    to: string
    id: string
    app_name: string
    role: AppRole
    creator_id: string
    admin_ids?: string[]
    created_at?: Ts
    avatar_url?: string | null
    logo_url?: string | null
    wordmark_url?: string | null
    ecosystem?: string
  }

  /** Profile extends Cell with richer metadata */
  export interface Profile extends Cell {
    app_short_name?: string | null
    slug?: string | null
    description?: string | null
    status?: AppStatus | null
    social_links?: App['social_links']
    join_requests?: string[]
    joinRequestCount?: number
    adminCount?: number
    updated_at?: Ts
  }
}
