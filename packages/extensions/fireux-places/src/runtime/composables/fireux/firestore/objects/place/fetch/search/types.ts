import type { FirestorePrefixSearchOptions } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreSearch'
import type { PlaceCard } from '../../utils/view/usePlacesInterface'

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

export type SearchStage = {
  results: PlaceCard.Card[]
  stage: string
  debug?: Record<string, unknown>
}

export type MapToCard = (p: any, collectionOverride?: string) => PlaceCard.Card

export type PrefixSearch = <T>(
  options: FirestorePrefixSearchOptions<T>
) => Promise<T[]>
