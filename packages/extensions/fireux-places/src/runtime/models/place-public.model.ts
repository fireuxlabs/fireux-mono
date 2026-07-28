// Concurrent edit — 2026-07-21 14:28 CEST — Place public projection: define the bounded browser-safe Place contract.
// Concurrent edit — 2026-07-21 15:05 CEST — Place provenance/privacy hardening: define Place identity as a non-sensitive public reference card, never a raw root.
// Concurrent edit — 2026-07-21 16:35 CEST — Place onboarding completion: expose safe locale defaults on detail without bloating directory cards.
// Concurrent edit — 2026-07-22 12:13 CEST — Place palette onboarding: expose validated public brand colours only on Place detail.
import type { SparseBrandPalette } from 'fireux-core/runtime/models/core/style.model'
import type {
  PlaceImageShade,
  PlaceType,
} from './place.model'

export const PUBLIC_PLACE_INDEX_PAGE_SIZE = 24
export const PUBLIC_PLACE_INDEX_MAX_PAGE_SIZE = 50
export const PUBLIC_PLACE_INDEX_SCAN_BATCH_SIZE = 50
export const PUBLIC_PLACE_INDEX_MAX_SCAN_SIZE = 200
export const PUBLIC_PLACE_EXACT_MAX_IDS = 24

export const PUBLIC_PLACE_PROJECTION_KEYS = [
  'id',
  'name',
  'place_type',
  'short_name',
  'brand_tagline',
  'short_address',
  'image_url',
  'image_shade',
  'verified',
  'slug',
] as const

/**
 * Browser-safe Place card. Exact coordinates, street/postal address, contact
 * details, ownership ids, provider metadata, and operational fields remain on
 * the canonical server-side root. Every collection row serializes this exact
 * key set so Live and Demo surfaces demonstrate the same public contract.
 */
export type PublicPlaceProjection = {
  id: string
  name: string
  place_type: PlaceType
  short_name: string
  brand_tagline: string
  short_address: string
  image_url: string
  image_shade: PlaceImageShade
  verified: boolean
  slug: string
}

export type PublicPlaceIndexPage = {
  items: PublicPlaceProjection[]
  nextCursor?: string
}

export type PublicPlaceDetailProjection = PublicPlaceProjection & {
  default_currency_code?: string
  timezone?: string
  brand_palette?: SparseBrandPalette
}

export type PublicPlaceDetailResponse = {
  item: PublicPlaceDetailProjection
}
