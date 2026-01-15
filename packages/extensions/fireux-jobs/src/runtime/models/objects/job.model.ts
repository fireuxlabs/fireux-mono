// FILE: packages/extensions/fireux-jobs/src/runtime/models/objects/job.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { FireuxAuthored } from 'fireux-core/runtime/models/core/meta.model'

/**
 * Job Firestore shape only.
 * Firestore: jobs/{id}
 *
 * Canon strategy:
 * - Runtime object is the single source of truth
 * - TypeScript derives types from it
 * - Drift is detected by comparing data ↔ model shape
 */

export type JobStatus = 'open' | 'closed'

// 🔑 Runtime + canonical shape (source of truth)
export const Job = {
  /** Firestore document ID */
  id: '',

  /** App that owns the job */
  app_id: '',

  /** FireUX user who created the listing (business field, not Firestore stamping) */
  created_by: '',

  /** Phase-1 graph links (horizontal MVP) */
  posted_by_agent_id: '',
  company_id: '',
  place_id: '',
  kitchen_id: '',
  source: '',

  /** Pipeline & preview surface */
  title: '',
  status: 'open' as JobStatus,
  description: '',

  // Authored (FireuxAuthored)
  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

// ✅ Type derived from the runtime model (no duplication)
export type Job = FireuxAuthored & {
  [K in keyof typeof Job]: (typeof Job)[K]
}
