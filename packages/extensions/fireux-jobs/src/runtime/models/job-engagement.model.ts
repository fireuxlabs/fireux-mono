import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model.ts'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase.ts'
import type {
  JobContractType,
  JobManagementMode,
} from './job.model.ts'

export const JobEngagementStorage = {
  collection: 'job-engagements',
  path: 'job-engagements/{engagementId}',
  idParam: 'engagementId',
} as const

export const JobHiringCapacityStorage = {
  collection: 'job-hiring-capacity',
  path: 'job-hiring-capacity/{capacityId}',
  idParam: 'capacityId',
} as const

export const JOB_ENGAGEMENT_STATUSES = [
  'accepted',
  'active',
  'completed',
  'cancelled',
] as const

export type JobEngagementStatus =
  (typeof JOB_ENGAGEMENT_STATUSES)[number]

export type JobEngagement = {
  id: string
  source_app_id: string
  source_ecosystem_id: string
  application_id: string
  job_id: string
  employer_user_id: string
  worker_user_id: string
  company_id: string
  place_id: string
  contract_type: JobContractType
  management_mode: JobManagementMode
  status: JobEngagementStatus
  direct_employment_terms_version: string
  start_at: FirebaseTimestamp | null
  end_at: FirebaseTimestamp | null
  started_at: FirebaseTimestamp | null
  completed_at: FirebaseTimestamp | null
  cancelled_at: FirebaseTimestamp | null
  created: FireuxStamped['created'] & {
    at: FirebaseTimestamp
    by: string
    app_id: string
  }
  updated: FireuxStamped['updated'] & {
    at: FirebaseTimestamp
    by: string
  }
}

export type JobEngagementAction = 'start' | 'complete' | 'cancel'

export type JobEngagementActionIntent = {
  action: JobEngagementAction
}
