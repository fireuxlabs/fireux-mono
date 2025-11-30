// FILE: packages/extensions/fireux-jobs/src/runtime/types/job.model.ts

import type { FirestoreTimestampOrString } from 'fireux-core/runtime/types/firebase.ts'

export type JobStatus = 'open' | 'closed' | 'draft'

type Ts = FirestoreTimestampOrString

export interface Job {
  id: string

  // Who owns / created the job
  user_id: string

  // Context
  app_id?: string | null
  kitchen_id?: string | null

  // Core job content
  title: string
  description?: string | null
  pay?: string | number | null
  status?: JobStatus

  // Metadata
  created_at: Ts
  updated_at?: Ts
}