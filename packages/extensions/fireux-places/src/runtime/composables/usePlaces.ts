import { useFirestoreManager } from '#fireux-core-composables/firestore/useFirestoreManager'
import type { Place } from '../models/place.model'
import { usePlacesSearch } from './usePlacesSearch'

export function usePlaces() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()
  const collection = firestoreFetchCollection<Place>('places')
  const place = (id: string) => firestoreFetchDoc<Place>('places', id)

  return {
    collection,
    place,
    ...usePlacesSearch(),
  }
}

// Preserved for reference while we decide what to keep:
// const { firestoreFetchDoc } = useFirestoreManager()
// const place = (id: string) => firestoreFetchDoc<Place>('places', id)
// const { savePlace } = usePlaceSave()
// async function getPlaceDetails(placeId: string) {
//   const details = await fetchPlaceDetails(placeId)
//   if (!details) return null
//   return { place: details.stored, raw: details.raw }
// }
