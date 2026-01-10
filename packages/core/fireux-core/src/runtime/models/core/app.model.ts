// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts

import type { FireuxAuthored } from './meta.model'
import type { AppRole, AppSocialLinks } from './app.supporting'

/**
 * Core Firestore App document
 * Path: /apps/<appId>
 *
 * Canon rules:
 * - No optional strings (empty string means unset)
 * - No nullable strings
 * - Timestamps are FirebaseTimestamp (Firestore Timestamp)
 */
export interface App extends FireuxAuthored {
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
  created_by: string

  // Content
  tagline: string
  description: string
  short_bio: string
  long_bio: string

  // Social
  social_links: AppSocialLinks

  // Derived counts
  user_count: number

  // Brand/media URLs (flat)
  thumbnail_url: string
  logo_url: string
  wordmark_light_url: string
  wordmark_dark_url: string
}
