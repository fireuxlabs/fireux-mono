import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { computed } from 'vue'
import { PlaceStorage, type Place } from 'fireux-places/runtime/models/place.model'

export function usePlaceCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<Place>(PlaceStorage.collection)

  const collection = computed<Place[]>(() => source.value ?? [])
  const count = computed(() => collection.value.length)
  const pending = computed(() => source.pending.value)
  const error = computed(() => source.error.value)
  const { outcome } = useFirestoreCollectionState({
    count,
    error,
    pending,
  })
  const byId = computed(() => {
    const map = new Map<string, Place>()
    for (const place of collection.value) {
      if (place?.id) map.set(String(place.id), place)
    }
    return map
  })

  return { collection, count, byId, pending, error, outcome }
}
