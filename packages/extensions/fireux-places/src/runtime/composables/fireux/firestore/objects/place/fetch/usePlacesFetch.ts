import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Place } from '../../../../../../models/objects/place.model'

const COLLECTION_PATH = 'places'

export function usePlacesFetch() {
  const { firestoreFetchDoc } = useFirestoreRead()

  const place = (id: string) => firestoreFetchDoc<Place>(COLLECTION_PATH, id)

  return { place }
}
