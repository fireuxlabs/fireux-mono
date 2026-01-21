import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import type { Kitchen } from '../../../../../../models/objects/kitchen.model'

const COLLECTION_PATH = 'kitchens'

/**
 * Canon fetch helpers for Kitchen (collection + single doc).
 * Canon: overlay collection `kitchens/{placeId}`.
 */
export function useKitchenFetch() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  const source = firestoreFetchCollection<Kitchen>(COLLECTION_PATH)
  const kitchens = computed(() => source.value ?? [])

  const kitchen = (id: string) => firestoreFetchDoc<Kitchen>(COLLECTION_PATH, id)

  return {
    kitchens,
    kitchen,
  }
}