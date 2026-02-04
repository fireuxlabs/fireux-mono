// FILE: packages/extensions/fireux-jobs/src/runtime/models/objects/job.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Kitchen } from 'fireux-kitchens/runtime/models/objects/kitchen.model'

/**
 * Job (canonical Firestore shape)
 * Firestore: jobs/{id}
 *
 * Principles:
 * - Stored shape only (no UI / no future theory)
 * - No optional nested objects
 * - Empty string = unset
 * - Small on purpose
 */

export type JobStatus = 'open' | 'closed'

// 🔑 Runtime canonical Job (source of truth)
export const Job = {
  /** Firestore document ID */
  id: '' as string,

  /** Ownership / graph */
  company_id: '' as string,
  kitchen_id: '' as string,

  /** Core job content */
  title: '' as string,
  description: '' as string,

  /** Lifecycle */
  status: 'open' as JobStatus,

  /** Authored (FireuxStamped) */
  app_id: undefined as FireuxStamped['app_id'],
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type Job = {
  [K in keyof typeof Job]: (typeof Job)[K]
} & FireuxStamped

/**
 * Read-time enrichment only (never stored)
 */
export type JobResolved = Job & {
  kitchen?: Kitchen | null
}

/**
 * Create / update helpers
 */
export type JobCreateInput = Omit<
  Job,
  'app_id' | 'creator_id' | 'created_at' | 'updated_at'
>

export type JobUpdateInput = Partial<Omit<JobCreateInput, 'id'>>
