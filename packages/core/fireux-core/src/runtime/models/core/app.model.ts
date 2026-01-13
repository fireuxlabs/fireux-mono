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

// Canonical shape keys for runtime validation.
// NOTE: This is intentionally co-located with the model to prevent drift.
export const APP_MODEL_KEYS = [
  'id',

  'app_name',
  'app_short_name',

  'role',
  'ecosystem',

  'join_requests',
  'admin_ids',
  'created_by',

  'tagline',
  'description',
  'short_bio',
  'long_bio',

  'social_links',

  'user_count',

  'thumbnail_url',
  'logo_url',
  'wordmark_light_url',
  'wordmark_dark_url',

  'creator_id',
  'created_at',
  'updated_at',
] as const satisfies readonly (keyof App)[]

// Required fields for health checks.
// Keep this intentionally strict; legacy docs will be flagged for migrate.
export const APP_MODEL_REQUIRED_KEYS = [
  'id',
  'app_name',
  'app_short_name',
  'role',
  'ecosystem',
  'creator_id',
  'created_at',
  'updated_at',
] as const satisfies readonly (keyof App)[]
