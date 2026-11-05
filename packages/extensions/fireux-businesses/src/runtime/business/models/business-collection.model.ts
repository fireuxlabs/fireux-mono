import type { Business } from './business.model'
import type { Place } from 'fireux-places/runtime/place/models/place.model'

export const BUSINESS_DIRECTORY_PAGE_SIZE = 24
export const BUSINESS_DIRECTORY_MAX_PAGE_SIZE = 50
export const BUSINESS_DIRECTORY_SCAN_BATCH_SIZE = 50
export const BUSINESS_DIRECTORY_MAX_SCAN_SIZE = 200

export type BusinessDirectoryPage = {
  businesses: Business[]
  places: Place[]
  nextCursor?: string
}

export type BusinessDetailResponse = {
  business: Business
  place: Place | null
}
