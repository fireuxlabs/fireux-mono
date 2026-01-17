// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
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

export type AppShape = FireuxAuthored & {
  // Identity
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

  // Derived
  user_count: number

  // Brand / media
  thumbnail_url: string
  logo_url: string
  wordmark_light_url: string
  wordmark_dark_url: string
}

// 🔑 Runtime + canonical shape (source of truth)
export const App: AppShape = {
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

  // Authored (FireuxAuthored)
  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

// ✅ Type derived from the runtime model (no duplication)
export type App = AppShape
