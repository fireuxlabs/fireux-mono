import { useFirestoreManager } from '#imports'
import type { Ref } from 'vue'
import type { Place, PlaceCard } from '../models/place.model'
import { usePlacesSearch, type UsePlacesSearchResult } from './usePlacesSearch'

export interface UsePlacesResult extends UsePlacesSearchResult {
  collection: Ref<Place[] | undefined>
  place: (id: string) => Ref<Place | undefined>
  searchPlaces: (query: string) => Promise<PlaceCard.Cell[]>
}

export function usePlaces(): UsePlacesResult {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  const collection = firestoreFetchCollection<Place>('places')
  const place = (id: string) => firestoreFetchDoc<Place>('places', id)

  return {
    collection,
    place,
    ...usePlacesSearch(collection),
  }
}
