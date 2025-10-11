import { useFirestoreManager } from '#imports'
import type { Place } from '../models/place.model'
import { usePlacesSearch } from './usePlacesSearch'

export function usePlaces() {
  const { firestoreFetchCollection } = useFirestoreManager()
  const collection = firestoreFetchCollection<Place>('places')

  return {
    collection,
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
