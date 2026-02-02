import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { hydratePlaceOverlayCollection, hydratePlaceOverlayDoc } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/usePlaceOverlayHydration'
import type { Place } from 'fireux-places/runtime/models/objects/place.model'
import { computed } from 'vue'
import type { Kitchen, KitchenOverlay } from '../../../../../../models/objects/kitchen.model'

const COLLECTION_PATH = 'kitchens'

/**
 * Canon fetch helpers for Kitchen (collection + single doc).
 * Canon: overlay collection `kitchens/{placeId}`.
 */
export function useKitchenFetch() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  const overlays = firestoreFetchCollection<KitchenOverlay>(COLLECTION_PATH)
  const places = firestoreFetchCollection<Place>('places')

  const kitchens = hydratePlaceOverlayCollection(
    computed(() => overlays.value ?? []),
    computed(() => places.value ?? []),
    (overlay, place): Kitchen => ({
      ...(place ?? {}),
      ...overlay,
      id: overlay.id,
    })
  )

  const kitchen = (id: string) => {
    const kitchenDoc = firestoreFetchDoc<KitchenOverlay>(COLLECTION_PATH, id)
    const placeDoc = firestoreFetchDoc<Place>('places', id)

    return hydratePlaceOverlayDoc(
      computed(() => kitchenDoc.value),
      computed(() => placeDoc.value),
      computed(() => id),
      (overlay, place, docId): Kitchen => ({
        ...(place ?? {}),
        ...(overlay ?? {}),
        id: docId,
      })
    )
  }

  return {
    kitchens,
    kitchen,
  }
}