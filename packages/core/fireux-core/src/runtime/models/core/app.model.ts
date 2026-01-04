// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts
import type { FirestoreTimestampOrString } from '../../../types/firebase'

export type AppRole = 'global' | 'tenant' | 'sandbox'
type Ts = FirestoreTimestampOrString

/** Core Firestore App document */
export interface App {
  id: string

  // Display
  app_name: string
  app_short_name: string

  // Scope + lineage
  role: AppRole
  ecosystem: string

  // Governance
  join_requests: string[]
  admin_ids: string[]
  creator_id: string
  created_by: string

  // Optional metadata
  tagline: string
  description: string
  short_bio: string
  long_bio: string
  social_links: { instagram: string }

  // Derived counts
  user_count: number

  // System metadata
  created_at: Ts
  updated_at: Ts

  // Brand/media URLs (flat)
  avatar_url: string
  logo_url: string
  wordmark_url: string
}
