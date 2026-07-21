// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: define caller-safe authoring intents without storage authority fields.
import type { Job } from './job.model'

export type JobMutableField =
  | 'company_id'
  | 'category_id'
  | 'workplace_type'
  | 'workplace_id'
  | 'workplace_label'
  | 'job_type'
  | 'openings_count'
  | 'pay_currency'
  | 'pay_rate'
  | 'pay_unit'
  | 'start_at'
  | 'end_at'
  | 'title'
  | 'description'
  | 'status'

/**
 * Browser authoring intent. Storage scope, visibility, identity, and audit
 * stamps are always derived by the trusted server boundary.
 */
export type JobCreateIntent = Pick<Job, JobMutableField>

export type JobPatchIntent = Partial<JobCreateIntent>

export type AuthorJobListResponse = {
  items: Job[]
  limit: number
  truncated: boolean
}

export type AuthorJobResponse = {
  job: Job
}

export type CreateAuthorJobResponse = AuthorJobResponse & {
  id: string
  created: true
}

export type PatchAuthorJobResponse = AuthorJobResponse & {
  id: string
  updated: true
}

export type PublishAuthorJobResponse = AuthorJobResponse & {
  id: string
  published: true
}
