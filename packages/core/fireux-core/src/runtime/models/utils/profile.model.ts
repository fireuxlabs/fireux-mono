// FILE: packages/core/fireux-core/src/runtime/models/utils/profile.model.ts

// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: distinguish public profiles from app-private records.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: support atomic domain-owned root profile seeds.
// Concurrent edit — 2026-07-20 17:41 CEST — Repo Efficiency Pass 2 of 6: route profile creation through trusted domain provisioners.
import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './stamps.model'

/**
 * Runtime models canon: docs/ai/gpt-context.md
 *
 * Family: Identity support
 * Storage: base shapes for root profile records and app overlays
 * Used by: /chefs/<userId>, /agents/<userId>, /professionals/<userId>, and similar identity profile collections
 *
 * Decision note:
 * - User is the only public identity truth; profile roots contain only their
 *   domain presentation/capability fields and use the matching uid.
 * - App profile records are overlays for app-specific presentation or capability state.
 * - Identity profile overlays do not use FireuxAppScope because they are not root-plus-app operational targets.
 * - This file defines the shared base shapes so individual profile files stay aligned.
 * - If the identity rule changes later, update the models README first, then this file.
 */
export const ProfileStorage = {
  shape: 'both',
  root: '{profileCollection}/{userId}',
  overlay: 'apps/{appId}/{profileCollection}/{userId}',
  idParam: 'userId',
} as const

export const AppProfileStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/{profileCollection}/{userId}',
  parent: 'app',
  idParam: 'userId',
} as const

export const AppProfileStamps = {
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

/**
 * Profile doc base shape (global truth)
 * Example path: /chefs/<uid>, /agents/<uid>, /professionals/<uid>, etc.
 *
 * Canon notes:
 * - Profiles are user-owned (the document uid is the authority).
 * - Only profile families that actually share these fields should use this
 *   base; domain models own their exact persisted creation shape.
 */
export type ProfileBase = FireuxStamped & {
  id: string

  title: string
  subtitle: string
  tagline: string
  tags: string[]
}

/** Smallest shared contract for root profiles and app-private profile records. */
export type ProfileRecord = {
  id: string
}

/**
 * App profile overlay base shape
 * Example path: /apps/<appId>/<collection>/<uid>
 *
 * Delta-only by design.
 * Keep it minimal until you truly need overlay fields.
 */
export type AppProfileBase = FireuxStamped & ProfileRecord

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

  /** Fixed authenticated endpoint that owns this profile's exact seed and writes. */
  provisionRoute: string

  /** Public profiles own a root record; app-private profiles exist only under the current App. */
  storage?: 'root-and-app' | 'app-only'
}
