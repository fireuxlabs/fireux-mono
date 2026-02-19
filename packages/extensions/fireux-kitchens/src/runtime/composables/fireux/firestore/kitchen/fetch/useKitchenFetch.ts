import { doc } from 'firebase/firestore'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { hydratePlaceCollection, hydratePlaceDoc } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/usePlaceHydration'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { computed, isRef, unref, type Ref } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import type { Kitchen, KitchenCollection } from '../../../../../models/kitchen.model'

const DEFAULT_COLLECTION_PATH = 'kitchens'

type UseKitchenFetchOptions = {
  collectionPath?: string
  hydrate?: boolean
}

type KitchenFetchOptions = {
  hydrate?: boolean
}

/**
 * Canon fetch helpers for Kitchen (collection + single doc).
 * Canon: collection `kitchens/{placeId}`.
 */
export function useKitchenFetch(options: UseKitchenFetchOptions = {}) {
  const collectionPath = options.collectionPath ?? DEFAULT_COLLECTION_PATH
  const { firestoreFetchCollection } = useFirestoreRead()
  const db = useFirestore()
  const shouldHydrateCollection = options.hydrate !== false

  const placesCollection = shouldHydrateCollection
    ? firestoreFetchCollection<Place>('places')
    : null

  const pickPlaceForKitchen = (
    place: Place | null
  ): Partial<
    Pick<
      Place,
      | 'name'
      | 'short_name'
      | 'short_address'
      | 'formatted_address'
      | 'lat'
      | 'lng'
      | 'image_url'
      | 'image_shade'
      | 'claimed_by'
      | 'source'
      | 'slug'
    >
  > => {
    if (!place) return {}
    return {
      name: place.name,
      short_name: place.short_name,
      short_address: place.short_address,
      formatted_address: place.formatted_address,
      lat: place.lat,
      lng: place.lng,
      image_url: place.image_url,
      image_shade: place.image_shade,
      claimed_by: place.claimed_by,
      source: place.source,
      slug: place.slug,
    }
  }

  // ✅ raw Firestore sources
  const kitchensCollection = firestoreFetchCollection<KitchenCollection>(collectionPath)

  // ✅ canonical hydration helpers (rename at call-site)
  const hydrate = hydratePlaceCollection
  const hydrateDoc = hydratePlaceDoc

  // ✅ hydrated collection (UI-ready)
  const kitchens = shouldHydrateCollection
    ? hydrate(
        computed(() => kitchensCollection.value ?? []),
        computed(() => placesCollection?.value ?? []),
        (entry, place): Kitchen => ({
          ...pickPlaceForKitchen(place),
          ...entry,
          id: entry.id,
        })
      )
    : computed<Kitchen[]>(() =>
        (kitchensCollection.value ?? []).map((entry) => ({
          ...entry,
          id: entry.id,
        }))
      )

  // ✅ hydrated single doc (UI-ready)
  const fetchDocRef = <T>(
    collectionRef: Ref<string>,
    idRef: Ref<string>,
    ssrKeyPrefix?: string
  ): Ref<T | undefined> => {
    const docRef = computed(() => {
      const resolvedPath = String(unref(collectionRef) || '').trim()
      const resolvedId = String(unref(idRef) || '').trim()
      if (!resolvedPath || !resolvedId) return null
      return doc(db, resolvedPath, resolvedId)
    })

    const ssrKey = computed(() => {
      const resolvedPath = String(unref(collectionRef) || '').trim()
      const resolvedId = String(unref(idRef) || '').trim()
      if (!resolvedPath || !resolvedId) return undefined
      return ssrKeyPrefix ? `${ssrKeyPrefix}-${resolvedPath}-${resolvedId}` : `${resolvedPath}-${resolvedId}`
    })

    const { data } = useDocument(docRef, {
      ssrKey,
      transform: (docSnap) => docSnap.data() as T | undefined,
    } as any)

    return data as Ref<T | undefined>
  }

  const kitchen = (
    id: string | Ref<string>,
    collectionPathOverride?: string | Ref<string>,
    kitchenOptions: KitchenFetchOptions = {}
  ) => {
    const idRef = isRef(id) ? id : computed(() => String(id))
    const pathRef = isRef(collectionPathOverride)
      ? collectionPathOverride
      : computed(() => String(collectionPathOverride || collectionPath))

    const resolvedId = computed(() => String(unref(idRef) || '').trim())
    const resolvedPath = computed(() => String(unref(pathRef) || '').trim())
    const shouldHydrateDoc = kitchenOptions.hydrate ?? shouldHydrateCollection

    const kitchenDoc = fetchDocRef<KitchenCollection>(resolvedPath, resolvedId)

    if (!shouldHydrateDoc) {
      return computed<Kitchen | undefined>(() => {
        const entry = kitchenDoc.value
        if (!entry) return undefined
        return {
          ...entry,
          id: String(entry.id ?? resolvedId.value).trim(),
        }
      })
    }

    const placeDoc = fetchDocRef<Place>(computed(() => 'places'), resolvedId, 'places')

    return hydrateDoc(
      computed(() => kitchenDoc.value),
      computed(() => placeDoc.value),
      computed(() => resolvedId.value),
      (entry, place, docId) => {
        if (!entry) return undefined
        return {
          ...pickPlaceForKitchen(place),
          ...entry,
          id: docId,
        }
      }
    )
  }

  return {
    kitchens,
    kitchen,
  }
}