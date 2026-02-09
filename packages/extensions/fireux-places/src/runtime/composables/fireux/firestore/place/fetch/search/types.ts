import type { FirestorePrefixSearchOptions } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreSearch'
import type { BasePlace } from 'fireux-places/runtime/models/place.model'

export type PlaceSearchDoc = {
  id?: string
  place_id?: string
  name: string
  short_name?: string
  formatted_address?: string
  short_address?: string
  place_image?: string | null
  image_url?: string | null
  search_term: string
  search_term_normalized?: string
  source?: string
  claimed_by?: string
}

export type BasePlaceRecord = BasePlace & { collection?: string }

export type SearchStage = {
  results: BasePlaceRecord[]
  stage: string
  debug?: Record<string, unknown>
}

export type MapToBasePlace = (p: any, collectionOverride?: string) => BasePlaceRecord

export type PrefixSearch = <T>(
  options: FirestorePrefixSearchOptions<T>
) => Promise<T[]>
