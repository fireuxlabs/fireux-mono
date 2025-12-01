// FILE: packages/extensions/fireux-jobs/src/runtime/models/job.model.ts

import type { FirestoreTimestampOrString } from 'fireux-core/runtime/types/firebase.ts'

export type JobStatus =
  | 'draft'
  | 'open'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'closed'
  | 'cancelled'

type Ts = FirestoreTimestampOrString

export interface JobTaskCounts {
  total?: number
  done?: number
  todo?: number
}

/**
 * Generic job document stored in jobs/{jobId}.
 */
export interface Job {
  id: string
  tenant_id: string
  created_by: string

  // Context links (optional per domain)
  agent_id?: string | null
  professional_id?: string | null
  location_id?: string | null
  /** @deprecated use tenant_id */
  app_id?: string | null
  /** @deprecated use location_id */
  kitchen_id?: string | null
  /** @deprecated use created_by */
  user_id?: string | null

  // Core job content
  title: string
  description?: string | null
  notes?: string | null
  pay?: string | number | null
  status?: JobStatus

  // Scheduling
  date?: string | null
  start_time?: string | null
  end_time?: string | null

  task_counts?: JobTaskCounts

  // Metadata
  created_at: Ts
  updated_at?: Ts
}
