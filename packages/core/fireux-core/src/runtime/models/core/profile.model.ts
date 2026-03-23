// FILE: packages/core/fireux-core/src/runtime/models/core/profile.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './meta.model'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Identity support
 * Storage: base shapes for root profile records and app overlays
 * Used by: /chefs/<userId>, /agents/<userId>, /professionals/<userId>, and similar identity profile collections
 *
 * Decision note:
 * - Profiles follow the same root-plus-overlay rule as other identity records when scoped truth is real.
 * - This file defines the shared base shapes so individual profile files stay aligned.
 * - If the identity rule changes later, update the models README first, then this file.
 */
export const ProfileCoreFields = {
  title: '' as string,
  subtitle: '' as string,
  tagline: '' as string,
  tags: [] as string[],
} as const

export const ProfileCoreStamps = {
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export const ProfileAppStamps = {
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

export function createProfileCoreSeed() {
  return {
    id: '' as string,
    title: ProfileCoreFields.title,
    subtitle: ProfileCoreFields.subtitle,
    tagline: ProfileCoreFields.tagline,
    tags: [...ProfileCoreFields.tags],
    created: { ...ProfileCoreStamps.created },
    updated: { ...ProfileCoreStamps.updated },
  }
}

export function createProfileAppSeed() {
  return {
    id: '' as string,
    created: { ...ProfileAppStamps.created },
    updated: { ...ProfileAppStamps.updated },
  }
}

/**
 * Core profile doc base shape (global truth)
 * Example path: /chefs/<uid>, /agents/<uid>, /professionals/<uid>, etc.
 *
 * Canon notes:
 * - Core profiles are user-owned (creator_id optional; uid is the authority)
 * - `tagline` is now universal (remove duplication from each profile)
 * - `tags` are stored (UI derives badges)
 */
export type CoreProfileBase = FireuxStamped & {
  id: string

  title: string
  subtitle: string
  tagline: string
  tags: string[]
}

/**
 * App profile overlay base shape (tenant truth)
 * Example path: /apps/<appId>/<collection>/<uid>
 *
 * Delta-only by design.
 * Keep it minimal until you truly need overlay fields.
 */
export type AppProfileBase = FireuxStamped & {
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
