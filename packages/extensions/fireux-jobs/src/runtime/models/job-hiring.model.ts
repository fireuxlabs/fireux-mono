import type { JobApplication } from './job-application.model.ts'
import type { JobEngagement } from './job-engagement.model.ts'
import type {
  JobContractType,
  JobManagementMode,
} from './job.model.ts'

export type JobHiringJobSummary = {
  id: string
  title: string
  contract_type: JobContractType
  management_mode: JobManagementMode
  company_id: string
  place_id: string
}

export type JobHiringCandidateSummary = {
  id: string
  title: string
  subtitle: string
  image: string
}

export type JobApplicationView = {
  application: JobApplication
  job: JobHiringJobSummary
  candidate: JobHiringCandidateSummary | null
  engagement: JobEngagement | null
}

export type JobApplicationListScope = 'candidate' | 'employer'

export type JobApplicationListResponse = {
  items: JobApplicationView[]
  limit: number
  truncated: boolean
}

export type JobApplicationResponse = {
  item: JobApplicationView
}

