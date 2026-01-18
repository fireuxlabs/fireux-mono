// FILE: packages/core/fireux-core/src/runtime/models/core/meta.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'

/** Canonical timestamps present on all Firestore documents. */
export interface FireuxTimestamps {
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

/** Optional authored metadata (creator may be absent for system writes). */
export interface FireuxAuthored {
  creator_id?: string
}

/** Convenience type: timestamps plus optional authored metadata. */
export type FireuxStamped = FireuxTimestamps & FireuxAuthored
