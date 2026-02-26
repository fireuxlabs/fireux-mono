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
 * - Stamping uses nested FireuxStamped fields (`created.by` optional)
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
  // Identity (runtime-resolved; do NOT persist duplicate id in Firestore)
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
  // (legacy flat creator fields removed; use `created.by`)

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
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
}

export type AppModel = typeof App

/**
 * Firestore storage shape (doc):
 * - Canon: Firestore doc id is the source of truth.
 * - Do not persist duplicate `id` field in the stored document.
 */
export type AppDoc = Omit<AppModel, 'id'>

/**
 * Runtime shape (resolved/hydrated):
 * - Always includes `id` (doc id) for routing/UI.
 */
export type AppResolved = AppModel

export { createEmptyAppSocialLinks } from './app.supporting'
export type { AppSocialLinks } from './app.supporting'
