// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: define the bounded browser-safe Job transport.
import type { JobPayUnit, JobType } from './job.model'

export const PUBLIC_JOB_INDEX_PAGE_SIZE = 24
export const PUBLIC_JOB_INDEX_MAX_PAGE_SIZE = 48
export const PUBLIC_JOB_INDEX_SCAN_BATCH_SIZE = 48
export const PUBLIC_JOB_INDEX_MAX_SCAN_SIZE = 240

/**
 * Browser-safe Job projection.
 *
 * Root ownership, creator stamps, Company/Place identifiers, and other
 * operational fields deliberately stay server-side.
 */
export type PublicJobProjection = {
  id: string
  source_app_id: string
  category_id: string
  visibility: 'public'
  status: 'open'
  workplace_type: string
  workplace_label: string
  job_type: JobType
  openings_count: number
  pay_currency: string
  pay_rate: number
  pay_unit: JobPayUnit
  title: string
  description: string
}

export type PublicJobIndexPage = {
  items: PublicJobProjection[]
  nextCursor?: string
}

export type PublicJobDetailResponse = {
  item: PublicJobProjection
}
