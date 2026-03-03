// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { AppDerived, AppMedia, AppRole, AppSocialLinks } from './supporting/app'
import type { FireuxStamped } from './meta.model'

/**
 * FireUX Canon (Consoleable, 2-layer)
 *
 * Core (root scope)
 * - Path: /apps/<appId>
 * - Purpose: identity + public/seo-safe content + brand
 *
 * App (tenancy scope / private overlay)
 * - Path: /apps/<appId>/apps/<appId>
 * - Purpose: governance + console/private switches + app-only policy
 *
 * Canon rules:
 * - Empty string means unset
 * - Arrays always exist
 * - Stamps use FireuxStamped nesting
 * - Firestore doc id is the source of truth; do not persist duplicate `id` in *Doc* types
 */

export interface AppCore {
  id: string
  app_name: string
  app_short_name: string
  role: AppRole
  ecosystem: string
  tagline: string
  description: string
  short_bio: string
  long_bio: string
  social_links: AppSocialLinks
  derived: AppDerived
  media: AppMedia
  // Existing runtime still reads these from /apps/<id>.
  join_requests: string[]
  admin_ids: string[]
  moderation_state: '' | 'ok' | 'limited' | 'banned'
  ban_reasons: string[]
  console_enabled: boolean
  created: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
  updated: {
    at: FirebaseTimestamp
    by?: FireuxStamped['updated']['by']
  }
}

/** Core (root scope): /apps/<appId> */
export const AppCore: AppCore = {
  id: '',
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
  join_requests: [],
  admin_ids: [],
  moderation_state: '',
  ban_reasons: [],
  console_enabled: true,
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

/** App overlay (tenancy/private): /apps/<appId>/apps/<appId> */
export interface AppApp {
  id: string
  join_requests: string[]
  admin_ids: string[]
  moderation_state: '' | 'ok' | 'limited' | 'banned'
  ban_reasons: string[]
  console_enabled: boolean
  created: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
    app_id?: FireuxStamped['created']['app_id']
  }
  updated: {
    at: FirebaseTimestamp
    by?: FireuxStamped['updated']['by']
  }
}

export const AppApp: AppApp = {
  id: '',
  join_requests: [],
  admin_ids: [],
  moderation_state: '',
  ban_reasons: [],
  console_enabled: true,
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
    app_id: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export type AppModel = AppCore

/** Firestore storage shape (core doc): do not persist duplicate `id`. */
export type AppCoreDoc = Omit<AppCore, 'id'>
/** Runtime-resolved (core): always includes `id`. */
export type AppCoreResolved = AppCore

/** Firestore storage shape (app overlay): do not persist duplicate `id`. */
export type AppAppDoc = Omit<AppApp, 'id'>
/** Runtime-resolved (app overlay): always includes `id`. */
export type AppAppResolved = AppApp
