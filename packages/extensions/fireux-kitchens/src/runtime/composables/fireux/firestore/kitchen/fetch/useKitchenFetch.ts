import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { hydratePlaceCollection, hydratePlaceDoc } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/usePlaceHydration'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { computed } from 'vue'
import type { Kitchen, KitchenCollection } from '../../../../../../models/kitchen.model'

const DEFAULT_COLLECTION_PATH = 'kitchens'

type UseKitchenFetchOptions = {
  collectionPath?: string
}

/**
 * Canon fetch helpers for Kitchen (collection + single doc).
 * Canon: collection `kitchens/{placeId}`.
 */
export function useKitchenFetch(options: UseKitchenFetchOptions = {}) {
  const collectionPath = options.collectionPath ?? DEFAULT_COLLECTION_PATH
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  // ✅ raw Firestore sources
  const kitchensCollection = firestoreFetchCollection<KitchenCollection>(collectionPath)
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
    const kitchenDoc = firestoreFetchDoc<KitchenCollection>(collectionPath, id)
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