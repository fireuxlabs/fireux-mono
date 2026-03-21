// FILE: packages/core/fireux-core/src/runtime/models/core/meta.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Model support
 * Storage: shared runtime model support, not a persisted entity
 * Used by: canonical root, overlay, facade, and scoped runtime models
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
 * Legacy flat stamp shape still present in stored data during migration.
 * Keep for migration tooling / transitional readers only.
 */
export interface FireuxLegacyStamped {
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
  creator_id?: string
  app_id?: string
}
