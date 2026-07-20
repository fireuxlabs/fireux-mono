// FILE: packages/core/fireux-core/src/runtime/models/core/profile.model.ts

// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: distinguish public profiles from app-private records.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: support atomic domain-owned root profile seeds.
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

export const ProfileFields = {
  title: '' as string,
  subtitle: '' as string,
  tagline: '' as string,
  tags: [] as string[],
} as const

export const ProfileStamps = {
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
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

export function createProfileSeed() {
  return {
    id: '' as string,
    title: ProfileFields.title,
    subtitle: ProfileFields.subtitle,
    tagline: ProfileFields.tagline,
    tags: [...ProfileFields.tags],
    created: { ...ProfileStamps.created },
    updated: { ...ProfileStamps.updated },
  }
}

export function createAppProfileSeed() {
  return {
    id: '' as string,
    created: { ...AppProfileStamps.created },
    updated: { ...AppProfileStamps.updated },
  }
}

/**
 * Profile doc base shape (global truth)
 * Example path: /chefs/<uid>, /agents/<uid>, /professionals/<uid>, etc.
 *
 * Canon notes:
 * - Profiles are user-owned (creator_id optional; uid is the authority)
 * - `tagline` is now universal (remove duplication from each profile)
 * - `tags` are stored (UI derives badges)
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

  /** Public profiles own a root record; app-private profiles exist only under the current App. */
  storage?: 'root-and-app' | 'app-only'

  /** Domain-owned fields that must be present atomically on the root record. */
  rootCreateData?: Record<string, unknown>

  /** Domain-owned fields that must be present atomically on the app record. */
  appCreateData?: Record<string, unknown>
}
