// FILE: packages/extensions/fireux-jobs/src/runtime/models/job.model.ts

export type JobStatus = 'open' | 'closed'

/**
 * Canonical job document for the minimal pipeline/preview flows.
 */
export interface Job {
  /** Firestore document ID */
  id: string

  /** Tenant/app that owns the job */
  tenant_id: string

  /** FireUX user who created the listing */
  created_by: string

  /** Pipeline & preview surface */
  title: string
  status: JobStatus
}
