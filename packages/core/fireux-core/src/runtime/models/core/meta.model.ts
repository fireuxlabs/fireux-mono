// FILE: packages/core/fireux-core/src/runtime/models/core/meta.model.ts

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
 * Canonical root facade relationship to app-scoped records.
 *
 * Root-plus-app entity families use this on the root public record so the
 * relationship is explicit instead of inferred from domain state or overlays.
 * Identity roots and profile roots do not use this; their app records are overlays.
 */
export type FireuxAppScopeState =
  | 'root_only'
  | 'parent_app'
  | 'dedicated_app'

export const FireuxAppScope = {
  app_scope_state: 'root_only' as FireuxAppScopeState,
  app_scope_app_id: '' as string,
} as const

export type FireuxAppScope = {
  [K in keyof typeof FireuxAppScope]: (typeof FireuxAppScope)[K]
}

/**
 * Canonical app-scoped support shape.
 *
 * Console entity rule:
 * - users operate console entities through `team_ids`
 * - join requests remain optional workflow state
 * - profiles such as Chef are domain extensions, not the stored access principal
 */
export const FireuxAppOverlayModel = {
  id: '' as string,
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

export type FireuxAppOverlay = {
  [K in keyof typeof FireuxAppOverlayModel]: (typeof FireuxAppOverlayModel)[K]
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
