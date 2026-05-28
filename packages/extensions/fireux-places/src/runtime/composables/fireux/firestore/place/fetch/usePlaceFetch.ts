import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { PlaceStorage, type Place } from 'fireux-places/runtime/models/place.model'

export function usePlaceFetch() {
  const { firestoreFetchDoc } = useFirestoreRead()

  const place = (id: string) => firestoreFetchDoc<Place>(PlaceStorage.collection, id)

  return { place }
}
