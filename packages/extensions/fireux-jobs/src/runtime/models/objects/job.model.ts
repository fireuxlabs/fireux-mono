// FILE: packages/extensions/fireux-jobs/src/runtime/models/objects/job.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

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

export type JobShape = FireuxStamped & {
  /** Firestore document ID */
  id: string

  /** App that owns the job */
  app_id: string

  /** FireUX user who created the listing (business field, not Firestore stamping) */
  created_by: string

  /** Phase-1 graph links (horizontal MVP) */
  posted_by_agent_id: string
  company_id: string
  place_id: string
  kitchen_id: string
  source: string

  /** Pipeline & preview surface */
  title: string
  status: JobStatus
  description: string
}

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

  // Authored (FireuxStamped)
  creator_id: undefined,
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} satisfies JobShape & Record<string, unknown>

// ✅ Type derived from the runtime model (no duplication)
export type Job = JobShape

export type JobCreateInput = Omit<Job, keyof FireuxStamped>
export type JobUpdateInput = Partial<Omit<JobCreateInput, 'id'>>
