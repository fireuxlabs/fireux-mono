// FILE: packages/extensions/fireux-jobs/src/runtime/models/objects/job.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Kitchen } from 'fireux-kitchens/runtime/models/objects/kitchen.model'

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

  /** Phase-1 graph links (horizontal MVP) */
  company_id: '',
  kitchen_id: '',

  /** Pipeline & preview surface */
  title: '',
  status: 'open' as JobStatus,
  description: '',

  // Authored (FireuxStamped)
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type Job = {
  [K in keyof typeof Job]: (typeof Job)[K]
} & FireuxStamped

export type JobResolved = Job & {
  kitchen?: Kitchen | null
}

export type JobCreateInput = Omit<
  Job,
  'app_id' | 'created_at' | 'updated_at' | 'creator_id'
>
export type JobUpdateInput = Partial<Omit<JobCreateInput, 'id'>>
