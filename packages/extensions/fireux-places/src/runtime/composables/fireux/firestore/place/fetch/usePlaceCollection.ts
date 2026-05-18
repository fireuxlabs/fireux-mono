import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import type { Place } from 'fireux-places/runtime/models/place.model'

const COLLECTION_PATH = 'places'

export function usePlaceCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<Place>(COLLECTION_PATH)

  const collection = computed<Place[]>(() => source.value ?? [])
  const count = computed(() => collection.value.length)
  const byId = computed(() => {
    const map = new Map<string, Place>()
    for (const place of collection.value) {
      if (place?.id) map.set(String(place.id), place)
    }
    return map
  })

  return { collection, count, byId }
}
