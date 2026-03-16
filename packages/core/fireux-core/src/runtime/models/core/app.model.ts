// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './meta.model'
import type { AppRole, AppSocialLinks } from './supporting/app'

/**
 * Entity Class: Root
 *
 * Canonical Path: /apps/<appId>
 *
 * App is the tenant boundary and should remain a single root entity.
 * Governance, console flags, identity, and branding all live on the same doc.
 *
 * Canon rules:
 * - Empty string means unset
 * - Arrays always exist
 * - Stamps use FireuxStamped nesting
 * - Firestore doc id is the source of truth; do not persist duplicate `id` in AppDoc
 */

export type AppStatus = 'draft' | 'active' | 'paused' | 'archived'

export const App = {
  id: '',

  // Registry + hierarchy
  project_id: '',
  ecosystem_id: '',
  slug: '',
  status: 'active' as AppStatus,
  team: '',

  // Identity + brand
  app_name: '',
  app_short_name: '',
  role: '' as AppRole,
  ecosystem: '',

  tagline: '',
  description: '',
  short_bio: '',
  long_bio: '',

  social_links: {} as AppSocialLinks,
  derived: {
    user_count: 0,
  },
  media: {
    thumbnail_url: '',
    logo_url: '',
    wordmark_light_url: '',
    wordmark_dark_url: '',
    cover_url: '',
  },

  // Governance + runtime flags
  join_requests: [],
  admin_ids: [],
  moderation_state: '',
  ban_reasons: [],
  console_enabled: true,

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type App = {
  [K in keyof typeof App]: (typeof App)[K]
}

export type AppDoc = Omit<App, 'id'>
export type AppResolved = App
export type AppCreateInput = Omit<App, 'id' | 'created' | 'updated'>
export type AppUpdateInput = Partial<Omit<AppCreateInput, never>>
