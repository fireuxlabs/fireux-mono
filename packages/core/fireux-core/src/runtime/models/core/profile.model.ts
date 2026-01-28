// FILE: packages/core/fireux-core/src/runtime/models/core/profile.model.ts

import type { FireuxStamped, FireuxTimestamps } from './meta.model'

/**
 * Core profile doc base shape (global truth)
 * Example path: /chefs/<uid>, /agents/<uid>, /professionals/<uid>, etc.
 *
 * Canon notes:
 * - Core profiles are user-owned (creator_id optional; uid is the authority)
 * - `tagline` is now universal (remove duplication from each profile)
 * - `tags` are stored (UI derives badges)
 */
export interface CoreProfileBase extends FireuxTimestamps {
  id: string

  title?: string
  subtitle?: string

  tagline?: string

  tags?: string[]
}

/**
 * App profile overlay base shape (tenant truth)
 * Example path: /apps/<appId>/<collection>/<uid>
 *
 * Delta-only by design.
 * Keep it minimal until you truly need overlay fields.
 */
export interface AppProfileBase extends FireuxStamped {
  id: string
}

/**
 * Config describing how a profile collection behaves.
 */
export interface ProfileConfig {
  /** Lowercase identifier like 'chef', 'supplier', 'agent', 'professional' */
  id: string

  /** Firestore collection name */
  collectionName: string

  /** Human-readable label */
  profileType: string

  /** CTA text for UI when profile missing */
  cta: string

  /** Label override for nav/dropdown contexts */
  navLabel: string

  /** Icon to reuse across nav/dropdown contexts */
  navIcon: string
}
