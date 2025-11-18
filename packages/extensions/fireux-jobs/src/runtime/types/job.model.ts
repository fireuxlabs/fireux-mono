// packages/extensions/fireux-jobs/src/runtime/types/job.model.ts
import type { FirestoreTimestampOrString } from 'fireux-core/runtime/types/firebase.ts'

export type JobStatus = 'open' | 'closed' | 'draft'

type Ts = FirestoreTimestampOrString

export interface Job {
  id: string
  created_by: string
  tenant_id: string
  title: string
  description?: string | null
  pay?: string | number | null
  status?: JobStatus
  created_at: Ts
  updated_at?: Ts
}
