import type { Place } from 'fireux-places/runtime/place/models/place.model'

export const COMPANY_DIRECTORY_PAGE_SIZE = 24
export const COMPANY_DIRECTORY_MAX_PAGE_SIZE = 50
export const COMPANY_DIRECTORY_SCAN_BATCH_SIZE = 50
export const COMPANY_DIRECTORY_MAX_SCAN_SIZE = 200

export type CompanyDirectoryEntry = Place
export type CompanyDetail = Place
export type CompanyView = CompanyDirectoryEntry & Partial<CompanyDetail>

export type CompanyDirectoryPage = {
  items: CompanyDirectoryEntry[]
  nextCursor?: string
}

export type CompanyDetailResponse = {
  company: CompanyDetail
}
