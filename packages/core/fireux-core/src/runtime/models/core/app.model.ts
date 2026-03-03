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

/** Core (root scope): /apps/<appId> */
export const AppCore = {
  // Identity (runtime-resolved)
  id: '',

  // Display (seo-safe)
  app_name: '',
  app_short_name: '',

  // Lineage / scope
  role: '' as AppRole,
  ecosystem: '',

  // Content (seo-safe)
  tagline: '',
  description: '',
  short_bio: '',
  long_bio: '',

  // Social (seo-safe)
  social_links: {} as AppSocialLinks,

  // Derived (safe to show; optional)
  derived: {
    user_count: 0,
  } as AppDerived,

  // Brand / media (safe to show; optional)
  media: {
    thumbnail_url: '',
    logo_url: '',
    wordmark_light_url: '',
    wordmark_dark_url: '',
    cover_url: '',
  } as AppMedia,

  // Stamps
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type AppCore = {
  [K in keyof typeof AppCore]: (typeof AppCore)[K]
}

/** App overlay (tenancy/private): /apps/<appId>/apps/<appId> */
export const AppApp = {
  // Identity (same id as core app id)
  id: '',

  // Governance (private)
  join_requests: [] as string[],
  admin_ids: [] as string[],

  // Optional moderation/policy (private) — keep minimal for now
  moderation_state: '' as '' | 'ok' | 'limited' | 'banned',
  ban_reasons: [] as string[],

  // Console / ops (private)
  console_enabled: true as boolean,

  // Stamps
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

export type AppApp = {
  [K in keyof typeof AppApp]: (typeof AppApp)[K]
}

export type AppModel = typeof AppCore

/** Firestore storage shape (core doc): do not persist duplicate `id`. */
export type AppCoreDoc = Omit<AppCore, 'id'>
/** Runtime-resolved (core): always includes `id`. */
export type AppCoreResolved = AppCore

/** Firestore storage shape (app overlay): do not persist duplicate `id`. */
export type AppAppDoc = Omit<AppApp, 'id'>
/** Runtime-resolved (app overlay): always includes `id`. */
export type AppAppResolved = AppApp