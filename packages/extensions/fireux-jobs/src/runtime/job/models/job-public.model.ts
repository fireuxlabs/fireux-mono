// Concurrent edit — 2026-07-21 13:09 CEST — Public Jobs projection: keep source App scope server-only in the bounded transport.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: project canonical employer, Place, schedule, and compensation truth.
import type {
  JobCompensation,
  JobContractType,
  JobManagementMode,
} from './job.model.ts'

export const PUBLIC_JOB_INDEX_PAGE_SIZE = 24
export const PUBLIC_JOB_INDEX_MAX_PAGE_SIZE = 48
export const PUBLIC_JOB_INDEX_SCAN_BATCH_SIZE = 48
export const PUBLIC_JOB_INDEX_MAX_SCAN_SIZE = 240

export type PublicJobCompanyProjection = {
  name: string
  short_name?: string
  image_url?: string
}

export type PublicJobPlaceProjection = {
  name: string
  short_name?: string
  short_address?: string
  image_url?: string
}

export type PublicJobApplicationDoorway = {
  label: string
  url: string
}

/**
 * Browser-safe Job projection.
 *
 * Root ownership, source App scope, audit stamps, Company/Place identifiers,
 * and other operational fields deliberately stay server-side.
 */
export type PublicJobProjection = {
  id: string
  category_id: string
  visibility: 'public'
  status: 'open'
  company: PublicJobCompanyProjection
  place: PublicJobPlaceProjection
  contract_type: JobContractType
  management_mode: JobManagementMode
  openings_count: number
  compensation: JobCompensation | null
  start_at: string | null
  end_at: string | null
  title: string
  description: string
  /**
   * Present only when this runtime is a catalogue doorway and the Job must be
   * actioned on its trusted source App.
   */
  application_doorway?: PublicJobApplicationDoorway
}

export type PublicJobIndexPage = {
  items: PublicJobProjection[]
  nextCursor?: string
}

export type PublicJobDetailResponse = {
  item: PublicJobProjection
}
