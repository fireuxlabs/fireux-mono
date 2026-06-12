import { computed, isRef, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { PlaceStorage, type Place } from 'fireux-places/runtime/models/place.model'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import type { KitchenSurface } from '../utils/view/useKitchenInterface'
import { useKitchenInterface } from '../utils/view/useKitchenInterface'

type KitchenCollectionDoc = KitchenSurface

type UseKitchenCollectionOptions = {
  hydrate?: boolean | Ref<boolean>
  ids?: string[] | Ref<string[] | null | undefined>
}

const normalize = (value: unknown) => String(value ?? '').trim()

/**
 * Public root Kitchen collection seam.
 *
 * Reads `kitchens/{kitchenId}` only. App-scoped operator records belong to
 * console/operator seams, not this collection.
 */
export function useKitchenCollection(options: UseKitchenCollectionOptions = {}) {
  const { surface } = useKitchenInterface()
  const { firestoreFetchCollection, firestoreLoadDocsByIds } = useFirestoreRead()
  const shouldHydrate = computed(() =>
    isRef(options.hydrate)
      ? options.hydrate.value !== false
      : options.hydrate !== false
  )
  const idSet = computed(() => {
    const ids = isRef(options.ids) ? options.ids.value : options.ids
    return new Set((ids ?? []).map((id) => normalize(id)).filter(Boolean))
  })
  const hasIdFilter = computed(() => {
    const ids = isRef(options.ids) ? options.ids.value : options.ids
    return Array.isArray(ids)
  })
  const idList = computed(() => Array.from(idSet.value))
  const rootCollectionPath = computed(() =>
    hasIdFilter.value ? '' : KitchenStorage.rootCollection
  )
  const rootSource = firestoreFetchCollection<KitchenCollectionDoc>(
    rootCollectionPath
  )
  const exactRootSource = firestoreLoadDocsByIds<KitchenCollectionDoc>({
    collectionPath: KitchenStorage.rootCollection,
    ids: idList,
  })
  const rootDocs = computed<KitchenCollectionDoc[]>(() =>
    hasIdFilter.value
      ? exactRootSource.docs.value ?? []
      : rootSource.value ?? []
  )
  const placeIds = computed(() =>
    Array.from(
      new Set(
        rootDocs.value
          .map((kitchen) => normalize(kitchen?.place_id))
          .filter(Boolean)
      )
    )
  )
  const placeCollectionPath = computed(() =>
    shouldHydrate.value && !hasIdFilter.value ? PlaceStorage.collection : ''
  )
  const placeSource = firestoreFetchCollection<Place>(placeCollectionPath)
  const exactPlaceSource = firestoreLoadDocsByIds<Place>({
    collectionPath: PlaceStorage.collection,
    ids: computed(() =>
      shouldHydrate.value && hasIdFilter.value ? placeIds.value : []
    ),
  })
  const placesById = computed(() => {
    const map = new Map<string, Place>()

    if (!shouldHydrate.value) return map

    const places = hasIdFilter.value
      ? exactPlaceSource.docs.value ?? []
      : placeSource.value ?? []

    for (const place of places) {
      const placeId = normalize(place?.id)
      if (placeId) map.set(placeId, place)
    }

    return map
  })
  const kitchens = computed<KitchenCollectionDoc[]>(() =>
    rootDocs.value
      .map((kitchen) => {
        const id = normalize(kitchen?.id)
        if (!id) return null
        if (hasIdFilter.value && !idSet.value.has(id)) return null

        const placeId = normalize(kitchen?.place_id)
        return surface({
          place: placeId ? placesById.value.get(placeId) ?? null : null,
          kitchen: {
            ...kitchen,
            id,
          },
          routeScope: kitchen.route_scope,
        })
      })
      .filter(Boolean) as KitchenCollectionDoc[]
  )
  const count = computed(() => kitchens.value.length)
  const pending = computed(() => {
    const rootPending = hasIdFilter.value
      ? exactRootSource.pending.value
      : rootSource.value === undefined
    const placePending = shouldHydrate.value
      ? hasIdFilter.value
        ? exactPlaceSource.pending.value
        : placeSource.value === undefined
      : false

    return rootPending || placePending
  })

  return {
    kitchens,
    count,
    pending,
  }
}
