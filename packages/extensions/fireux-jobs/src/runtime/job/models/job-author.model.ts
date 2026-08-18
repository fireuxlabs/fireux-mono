// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: define caller-safe authoring intents without storage authority fields.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: derive caller intents from the canonical safe input contract.
import type {
  Job,
  JobCreateInput,
  JobUpdateInput,
} from './job.model.ts'

export type JobMutableField = keyof JobUpdateInput

/**
 * Browser authoring intent. Storage scope, visibility, identity, and audit
 * stamps are always derived by the trusted server boundary.
 */
export type JobCreateIntent = JobCreateInput

export type JobPatchIntent = JobUpdateInput

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
