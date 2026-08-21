// FILE: packages/core/fireux-core/src/runtime/models/utils/profile.model.ts

// User owns every profile; optional App state remains below that profile.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: support atomic domain-owned root profile seeds.
// Concurrent edit — 2026-07-20 17:41 CEST — Repo Efficiency Pass 2 of 6: route profile creation through trusted domain provisioners.
import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './stamps.model'

/**
 * Runtime models canon: docs/ai/gpt-context.md
 *
 * Family: Identity support
 * Storage: users/<userId>/profiles/<profileKind> with optional app-state/<appId>
 *
 * Decision note:
 * - User is the only person identity truth.
 * - App profile state exists only for genuine App-specific capability state.
 * - This file defines the shared base shapes so individual profile files stay aligned.
 * - If the identity rule changes later, update the models README first, then this file.
 */
export const ProfileStorage = {
  shape: 'user-owned',
  profile: 'users/{userId}/profiles/{profileKind}',
  appState: 'users/{userId}/profiles/{profileKind}/app-state/{appId}',
  idParam: 'userId',
} as const

export const ProfileAppStateStorage = {
  shape: 'scoped',
  path: ProfileStorage.appState,
  parent: 'profile',
  idParam: 'appId',
} as const

export const ProfileAppStateStamps = {
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
 * Example path: /users/<uid>/profiles/chef.
 *
 * Canon notes:
 * - Profiles are user-owned (the document uid is the authority).
 * - Only profile families that actually share these fields should use this
 *   base; domain models own their exact persisted creation shape.
 */
export type ProfileBase = FireuxStamped & {
  id: string
  kind: string

  title: string
  subtitle: string
  tagline: string
  tags: string[]
}

/** Smallest shared contract for a profile or its App-specific state. */
export type ProfileRecord = {
  id: string
}

/**
 * Profile App-state base shape
 * Example path: /users/<uid>/profiles/<kind>/app-state/<appId>
 *
 * Delta-only by design.
 * Keep it minimal until you truly need overlay fields.
 */
export type ProfileAppStateBase = FireuxStamped &
  ProfileRecord & {
    profile_kind: string
    app_id: string
  }

/**
 * Config describing how a profile collection behaves.
 */
export interface ProfileConfig {
  /** Fixed profile document kind below users/{uid}/profiles. */
  kind: string

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

  /** Profiles are User-owned; some add genuine App-specific state. */
  storage?: 'user' | 'user-with-app-state'
}
