// FILE: packages/extensions/fireux-jobs/src/runtime/models/job.model.ts

export type JobStatus = 'open' | 'closed'

/**
 * Canonical job document for the minimal pipeline/preview flows.
 */
export interface Job {
  /** Firestore document ID */
  id: string

  /** App that owns the job */
  app_id: string

  /** FireUX user who created the listing */
  created_by: string

  /** Phase-1 graph links (horizontal MVP) */
  posted_by_agent_id?: string | null
  company_id?: string | null
  place_id?: string | null
  kitchen_id?: string | null
  source?: string | null

  /** Pipeline & preview surface */
  title: string
  status: JobStatus
  description?: string | null
}
