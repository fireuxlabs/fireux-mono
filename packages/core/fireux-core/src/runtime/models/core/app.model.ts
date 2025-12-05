// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts
import type { FirestoreTimestampOrString } from '../../types/firebase.ts'

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
