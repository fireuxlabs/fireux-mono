import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { hydratePlaceCollection, hydratePlaceDoc } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/usePlaceHydration'
import type { Place } from 'fireux-places/runtime/models/objects/place.model'
import { computed } from 'vue'
import type { Kitchen, KitchenCollection } from '../../../../../../models/objects/kitchen.model'

const COLLECTION_PATH = 'kitchens'

/**
 * Canon fetch helpers for Kitchen (collection + single doc).
 * Canon: collection `kitchens/{placeId}`.
 */
export function useKitchenFetch() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  // ✅ raw Firestore sources
  const kitchensCollection = firestoreFetchCollection<KitchenCollection>(COLLECTION_PATH)
  const placesCollection = firestoreFetchCollection<Place>('places')

  // ✅ canonical hydration helpers (rename at call-site)
  const hydrate = hydratePlaceCollection
  const hydrateDoc = hydratePlaceDoc

  // ✅ hydrated collection (UI-ready)
  const kitchens = hydrate(
    computed(() => kitchensCollection.value ?? []),
    computed(() => placesCollection.value ?? []),
    (entry, place): Kitchen => ({
      ...(place ?? {}),
      ...entry,
      id: entry.id,
    })
  )

  // ✅ hydrated single doc (UI-ready)
  const kitchen = (id: string) => {
    const kitchenDoc = firestoreFetchDoc<KitchenCollection>(COLLECTION_PATH, id)
    const placeDoc = firestoreFetchDoc<Place>('places', id)

    return hydrateDoc(
      computed(() => kitchenDoc.value),
      computed(() => placeDoc.value),
      computed(() => id),
      (entry, place, docId): Kitchen => ({
        ...(place ?? {}),
        ...(entry ?? {}),
        id: docId,
      })
    )
  }

  return {
    kitchens,
    kitchen,
  }
}