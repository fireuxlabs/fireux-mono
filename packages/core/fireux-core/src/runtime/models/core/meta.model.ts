// FILE: packages/core/fireux-core/src/runtime/models/core/meta.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'

/**
 * Canonical timestamps present on all Firestore documents.
 */
export interface FireuxTimestamps {
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

/**
 * Optional authored metadata.
 * Creator may be absent for system or migration writes.
 */
export interface FireuxAuthored {
  creator_id?: string
  app_id?: string
}

/**
 * Convenience type used by all persisted models.
 */
export type FireuxStamped = FireuxTimestamps & FireuxAuthored
