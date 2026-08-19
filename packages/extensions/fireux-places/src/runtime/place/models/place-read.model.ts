import { PlaceDefaults, type Place } from './place.model.ts'

export const PLACE_INDEX_PAGE_SIZE = 24
export const PLACE_INDEX_MAX_PAGE_SIZE = 50
export const PLACE_INDEX_SCAN_BATCH_SIZE = 50
export const PLACE_INDEX_MAX_SCAN_SIZE = 200
export const PLACE_EXACT_MAX_IDS = 24

/** Transport metadata around canonical Place records. */
export type PlaceIndexPage = {
  items: Place[]
  nextCursor?: string
}

export type PlaceDetailResponse = {
  place: Place
}

/** Development diagnostics describe the canonical Entity, not a second DTO. */
export const PlaceDetailDebugModel = PlaceDefaults satisfies Record<
  string,
  unknown
>

export const PlaceDetailDebugRequiredPaths = [
  'id',
  'name',
  'place_type',
  'short_name',
  'slug',
] as const
