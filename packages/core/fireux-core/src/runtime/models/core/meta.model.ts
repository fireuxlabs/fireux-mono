// FILE: packages/core/fireux-core/src/runtime/models/core/meta.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'

/** Canonical timestamps present on all Firestore documents. */
export interface FireuxTimestamps {
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
  /**
   * Optional client-side epoch milliseconds used for optimistic ordering
   * when callers request higher-accuracy stamping (mode='time'|'pinpoint').
   */
  created_at_client?: number
  /** Optional high-resolution timing details (opt-in). */
  created_at_precise?: { ms: number; hr?: number | null }
  /** Optional stamp mode when non-default (date). */
  stamp_mode?: 'none' | 'date' | 'time' | 'pinpoint'
}

export interface FireuxAuthored extends FireuxTimestamps {
  creator_id: string
}
