import { useFirestoreManager } from 'fireux-core/runtime/composables/firestore/useFirestoreManager.ts'
import type { Place } from '../models/place.model'
import { usePlacesSearch } from './usePlacesSearch'
import { usePlaceSave } from './usePlaceSave'

export function usePlaces() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()
  const collection = firestoreFetchCollection<Place>('places')
  const place = (id: string) => firestoreFetchDoc<Place>('places', id)

  return {
    collection,
    place,
    ...usePlacesSearch(),
    ...usePlaceSave(),
  }
}

// Preserved for reference while we decide what to keep:
// const { firestoreFetchDoc } = useFirestoreManager()
// const place = (id: string) => firestoreFetchDoc<Place>('places', id)
// const { ensurePlaceExists } = usePlaceSave()
// async function getPlaceDetails(placeId: string) {
//   const details = await fetchPlaceDetails(placeId)
//   if (!details) return null
//   return { place: details.stored, raw: details.raw }
// }
