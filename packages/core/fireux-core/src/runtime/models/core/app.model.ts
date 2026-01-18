// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { AppRole, AppSocialLinks } from './app.supporting'
import type { FireuxStamped } from './meta.model'

/**
 * Core Firestore App document
 * Path: /apps/<appId>
 *
 * Canon rules:
 * - No optional strings (empty string means unset)
 * - No nullable strings
 * - Runtime object is the single source of truth
 * - TypeScript derives types from runtime
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
  // (removed legacy `created_by` — use `creator_id` instead)

  // Content
  tagline: '',
  description: '',
  short_bio: '',
  long_bio: '',

  // Social
  social_links: {
    website: '',
    twitter: '',
    github: '',
    linkedin: '',
    instagram: '',
  } as AppSocialLinks,

  // Derived (system-managed)
  user_count: 0,

  // Brand / media
  thumbnail_url: '',
  logo_url: '',
  wordmark_light_url: '',
  wordmark_dark_url: '',

  // Stamps
  creator_id: undefined,
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} satisfies FireuxStamped & Record<string, unknown>

// ✅ Type derived from the runtime model (no duplication)
export type App = typeof App
