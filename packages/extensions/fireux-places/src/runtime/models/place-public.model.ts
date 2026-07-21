// Concurrent edit — 2026-07-21 14:28 CEST — Place public projection: define the bounded browser-safe Place contract.
// Concurrent edit — 2026-07-21 15:05 CEST — Place provenance/privacy hardening: define Place identity as a non-sensitive public reference card, never a raw root.
import type {
  PlaceImageShade,
  PlaceType,
} from './place.model'

export const PUBLIC_PLACE_INDEX_PAGE_SIZE = 24
export const PUBLIC_PLACE_INDEX_MAX_PAGE_SIZE = 50
export const PUBLIC_PLACE_INDEX_SCAN_BATCH_SIZE = 50
export const PUBLIC_PLACE_INDEX_MAX_SCAN_SIZE = 200
export const PUBLIC_PLACE_EXACT_MAX_IDS = 24

/**
 * Browser-safe Place card. Exact coordinates, street/postal address, contact
 * details, ownership ids, provider metadata, and operational fields remain on
 * the canonical server-side root.
 */
export type PublicPlaceProjection = {
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

export type PublicPlaceIndexPage = {
  items: PublicPlaceProjection[]
  nextCursor?: string
}

export type PublicPlaceDetailResponse = {
  item: PublicPlaceProjection
}
