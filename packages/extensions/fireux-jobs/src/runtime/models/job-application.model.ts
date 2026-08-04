import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export const JobApplicationStorage = {
  collection: 'job-applications',
  path: 'job-applications/{applicationId}',
  idParam: 'applicationId',
} as const

export const JOB_APPLICATION_STATUSES = [
  'submitted',
  'offered',
  'engaged',
  'rejected',
  'withdrawn',
] as const

export type JobApplicationStatus = (typeof JOB_APPLICATION_STATUSES)[number]

export const DIRECT_EMPLOYMENT_TERMS_VERSION = '2026-07-26' as const

export type JobApplication = {
  id: string
  source_app_id: string
  source_ecosystem_id: string
  job_id: string
  employer_user_id: string
  candidate_user_id: string
  company_id: string
  place_id: string
  message: string
  status: JobApplicationStatus
  offer_job_updated_at: FirebaseTimestamp | null
  direct_employment_terms_version: string | null
  direct_employment_terms_accepted_at: FirebaseTimestamp | null
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

export type JobApplicationCreateIntent = {
  message?: string
}

export type JobApplicationAction = 'offer' | 'reject' | 'withdraw' | 'accept'

export type JobApplicationActionIntent = {
  action: JobApplicationAction
  accept_direct_employment_terms?: boolean
}
