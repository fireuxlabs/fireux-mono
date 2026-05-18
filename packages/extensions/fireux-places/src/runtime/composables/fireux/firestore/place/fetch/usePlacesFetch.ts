import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Place } from 'fireux-places/runtime/models/place.model'

const COLLECTION_PATH = 'places'

/**
 * @deprecated Use `usePlaceFetch()` from `./usePlaceFetch`.
 * This remains as a compatibility path for older callers.
 */
export function usePlacesFetch() {
  const { firestoreFetchDoc } = useFirestoreRead()

  const place = (id: string) => firestoreFetchDoc<Place>(COLLECTION_PATH, id)

  return { place }
}
