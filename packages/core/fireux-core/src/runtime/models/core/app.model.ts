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
 *
 * Canon strategy:
 * - Runtime object is the single source of truth
 * - TypeScript derives types from it
 * - Drift is detected by comparing data ↔ model shape
 */

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
  created_by: '',

  // Content
  tagline: '',
  description: '',
  short_bio: '',
  long_bio: '',

  // Social
  social_links: {} as AppSocialLinks,

  // Derived
  user_count: 0,

  // Brand / media
  thumbnail_url: '',
  logo_url: '',
  wordmark_light_url: '',
  wordmark_dark_url: '',
} as const

// ✅ Type derived from the runtime model (no duplication)
export type App = FireuxAuthored & {
  [K in keyof typeof App]: (typeof App)[K]
}
