import type { Company } from 'fireux-companies/runtime/place/models/company.model'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type {
  Job,
  JobCompensation,
  JobContractType,
  JobManagementMode,
} from './job.model.ts'

export const JOB_DIRECTORY_PAGE_SIZE = 24
export const JOB_DIRECTORY_MAX_PAGE_SIZE = 48
export const JOB_DIRECTORY_SCAN_BATCH_SIZE = 48
export const JOB_DIRECTORY_MAX_SCAN_SIZE = 240

export type JobCompanySummary = {
  name: string
  short_name?: string
  image_url?: string
}

export type JobPlaceSummary = {
  name: string
  short_name?: string
  short_address?: string
  image_url?: string
}

export type JobApplicationDoorway = {
  label: string
  url: string
}

/** Bounded, joined card view for the paginated Job Directory. */
export type JobDirectoryEntry = {
  id: string
  category_id: string
  company_id: string
  place_id: string
  visibility: 'public'
  status: 'open'
  company: JobCompanySummary
  place: JobPlaceSummary
  contract_type: JobContractType
  management_mode: JobManagementMode
  openings_count: number
  compensation: JobCompensation | null
  start_at: string | null
  end_at: string | null
  title: string
  description: string
  application_doorway?: JobApplicationDoorway
}

export type JobDirectoryPage = {
  items: JobDirectoryEntry[]
  nextCursor?: string
}

/** Canonical Job detail plus the exact related records required by the page. */
export type JobDetailResponse = {
  job: Job
  company: Company
  companyPlace: Place
  place: Place
  applicationDoorway?: JobApplicationDoorway
}
