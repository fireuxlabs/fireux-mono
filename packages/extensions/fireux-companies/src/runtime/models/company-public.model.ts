// Concurrent edit — 2026-07-21 14:30 CEST — Company public projection: define a bounded same-id Company and Place read contract.
// Concurrent edit — 2026-07-21 14:52 CEST — Place provenance/privacy hardening: keep the Company DTO independently card-safe as Place evolves.
import type {
  PlaceImageShade,
  PlaceType,
} from 'fireux-places/runtime/models/place.model'

export const PUBLIC_COMPANY_INDEX_PAGE_SIZE = 24
export const PUBLIC_COMPANY_INDEX_MAX_PAGE_SIZE = 50
export const PUBLIC_COMPANY_INDEX_SCAN_BATCH_SIZE = 50
export const PUBLIC_COMPANY_INDEX_MAX_SCAN_SIZE = 200

export type PublicCompanyProjection = {
  id: string
  name: string
  place_type: PlaceType
  short_name?: string
  brand_tagline?: string
  short_address?: string
  image_url?: string
  image_shade?: Exclude<PlaceImageShade, 'none'>
  verified?: boolean
  slug?: string
}

export type PublicCompanyIndexPage = {
  items: PublicCompanyProjection[]
  nextCursor?: string
}

export type PublicCompanyDetailResponse = {
  item: PublicCompanyProjection
}
