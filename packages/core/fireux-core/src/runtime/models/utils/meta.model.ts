// FILE: packages/core/fireux-core/src/runtime/models/utils/meta.model.ts
// Concurrent edit — 2026-07-20 22:24 CEST — Both-Entity Authority: clarify canonical-root relationship and app support semantics.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name access support directly without changing persisted fields.

import type { FirebaseTimestamp } from '../../../types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Model support
 * Storage: shared runtime model support, not a persisted entity
 * Used by: canonical root, app-scoped, facade, and scoped runtime models
 *
 * Decision note:
 * - Stamps live with runtime models because they define persisted model shape across the repo.
 * - This file is support for the model layer, not a separate entity family of its own.
 * - If this contract changes later, update the models README first, then this file.
 */
export interface FireuxCreatedStamp {
  at: FirebaseTimestamp
  by?: string
  app_id?: string
}

export interface FireuxUpdatedStamp {
  at: FirebaseTimestamp
  by?: string
}

/**
 * Canonical nested stamps for persisted FireUX entities.
 */
export interface FireuxStamps {
  created: FireuxCreatedStamp
  updated: FireuxUpdatedStamp
}

/**
 * Convenience type used by persisted models.
 */
export type FireuxStamped = FireuxStamps

/**
 * Canonical root scoping support for root-first entities that are filtered by app/ecosystem
 * ownership without requiring app-local storage.
 */
export type FireuxRootOwnerType =
  | 'app'
  | 'ecosystem'
  | 'company'
  | 'place'
  | 'user'

export type FireuxRootVisibility = 'app' | 'ecosystem' | 'public'

export const FireuxRootScope = {
  source_app_id: '' as string,
  source_ecosystem_id: '' as string,
  owner_type: 'app' as FireuxRootOwnerType,
  owner_id: '' as string,
  visibility: 'app' as FireuxRootVisibility,
} as const

export type FireuxRootScope = {
  [K in keyof typeof FireuxRootScope]: (typeof FireuxRootScope)[K]
}

/**
 * Canonical root relationship to app-scoped support records.
 *
 * Root-plus-app entity families use this on the canonical root so the
 * relationship is explicit instead of inferred from domain state or app
 * records. Root placement does not itself make the record public-readable.
 * Identity and profile roots do not use this; their App records have separate
 * membership or profile-delta contracts.
 */
export type FireuxAppScopeState =
  | 'root_only'
  | 'parent_app'
  | 'tenant_app'

/**
 * Normalizes stored scope state into the current vocabulary.
 *
 * `dedicated_app` remains read-only migration input until existing Firestore
 * records have been rewritten. New models and writers must use `tenant_app`.
 */
export function normalizeFireuxAppScopeState(
  value: unknown
): FireuxAppScopeState | '' {
  const state = String(value ?? '').trim()

  if (state === 'dedicated_app') return 'tenant_app'
  if (
    state === 'root_only' ||
    state === 'parent_app' ||
    state === 'tenant_app'
  ) {
    return state
  }

  return ''
}

/**
 * Maps an app runtime role to the ownership state written on root-plus-app
 * entities. Standalone apps directly own their App support record, so they use the
 * same `parent_app` relationship as global apps. Unknown roles fail closed.
 */
export function resolveFireuxAppScopeStateForRole(
  value: unknown
): Exclude<FireuxAppScopeState, 'root_only'> | '' {
  const role = String(value ?? '').trim()

  if (role === 'tenant') return 'tenant_app'
  if (role === 'global' || role === 'standalone') return 'parent_app'
  return ''
}

export const FireuxAppScope = {
  app_scope_state: 'root_only' as FireuxAppScopeState,
  app_scope_app_id: '' as string,
} as const

export type FireuxAppScope = {
  [K in keyof typeof FireuxAppScope]: (typeof FireuxAppScope)[K]
}

/**
 * Nested console entity buckets for root-plus-app console families.
 *
 * These are the shared level-one model namespaces used by console-backed
 * entities before domain-specific operation config is added.
 */
export const FireuxConsoleEntityAppScopeModel = {
  state: 'root_only' as FireuxAppScopeState,
  app_id: '' as string,
} as const

export type FireuxConsoleEntityAppScope = {
  [K in keyof typeof FireuxConsoleEntityAppScopeModel]:
    (typeof FireuxConsoleEntityAppScopeModel)[K]
}

export const FireuxConsoleEntityVisibilityModel = {
  show: false as boolean,
  active: true as boolean,
  is_test: false as boolean,
} as const

export type FireuxConsoleEntityVisibility = {
  [K in keyof typeof FireuxConsoleEntityVisibilityModel]:
    (typeof FireuxConsoleEntityVisibilityModel)[K]
}

export const FireuxConsoleEntityIdentityModel = {
  display_name: '' as string,
  tagline: '' as string,
  image_url: '' as string,
  gallery: [] as string[],
} as const

export type FireuxConsoleEntityIdentity = {
  [K in keyof typeof FireuxConsoleEntityIdentityModel]:
    (typeof FireuxConsoleEntityIdentityModel)[K]
}

export const FireuxConsoleAccessModel = {
  operator_ids: [] as string[],
} as const

export type FireuxConsoleAccess = {
  [K in keyof typeof FireuxConsoleAccessModel]: (typeof FireuxConsoleAccessModel)[K]
}

/**
 * Canonical app-scoped access-support shape, never a second entity identity.
 *
 * Console entity rule:
 * - users see/select console entities through `team_ids`
 * - users write/operate console entities through `operator_ids`
 * - join requests remain optional workflow state
 * - profiles such as Chef are domain extensions, not the stored access principal
 */
export const FireuxAppAccessRecordModel = {
  id: '' as string,
  ...FireuxConsoleAccessModel,
  team_ids: [] as string[],
  join_requests: [] as string[],
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

export type FireuxAppAccessRecord = {
  [K in keyof typeof FireuxAppAccessRecordModel]:
    (typeof FireuxAppAccessRecordModel)[K]
}

/**
 * Legacy flat stamp shape still present in stored data during migration.
 * Keep for migration tooling / transitional readers only.
 */
export interface FireuxLegacyStamped {
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
  creator_id?: string
  app_id?: string
}
