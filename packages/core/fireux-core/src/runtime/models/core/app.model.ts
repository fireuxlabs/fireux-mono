// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { AppRole, AppSocialLinks } from './app.supporting'
import type { FireuxStamped } from './meta.model'

/**
 * Core Firestore App document
 * Path: /apps/<appId>
 *
 * Canon rules:
 * - Empty string means unset
 * - Arrays always exist
 * - Stamping is FireuxStamped (creator_id optional)
 *
 * NOTE: This file is runtime-canon (used by drift tooling AND app code).
 */

export type AppMedia = {
  thumbnail_url: string
  logo_url: string
  wordmark_light_url: string
  wordmark_dark_url: string
  cover_url: string
}

export type AppDerived = {
  user_count: number
}

// 🔑 Runtime + canonical shape (source of truth)
export const App = {
  // Identity
  id: '',

  // Display
  app_name: '',
  app_short_name: '',

  // Scope + lineage
  role: '' as AppRole,
  ecosystem: '',

  // Governance
  join_requests: [] as string[],
  admin_ids: [] as string[],
  // (removed legacy `created_by` — use `creator_id` instead)

  // Content
  tagline: '',
  description: '',
  short_bio: '',
  long_bio: '',

  // Social
  social_links: {} as AppSocialLinks,

  // Derived (keep grouped for future expansion)
  derived: {
    user_count: 0,
  } as AppDerived,

  // Brand / media (keep grouped for future expansion)
  media: {
    thumbnail_url: '',
    logo_url: '',
    wordmark_light_url: '',
    wordmark_dark_url: '',
    cover_url: '',
  } as AppMedia,

  // Stamps
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type AppModel = typeof App

export { createEmptyAppSocialLinks } from './app.supporting'
export type { AppSocialLinks } from './app.supporting'

