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
  const { firestoreFetchCollection } = useFirestoreRead()
  const rootSource = firestoreFetchCollection<KitchenCollectionDoc>(
    KitchenStorage.rootCollection
  )
  const placeSource = firestoreFetchCollection<Place>(PlaceStorage.collection)
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
  const placesById = computed(() => {
    const map = new Map<string, Place>()

    if (!shouldHydrate.value) return map

    for (const place of placeSource.value ?? []) {
      const placeId = normalize(place?.id)
      if (placeId) map.set(placeId, place)
    }

    return map
  })
  const kitchens = computed<KitchenCollectionDoc[]>(() =>
    (rootSource.value ?? [])
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
      .filter((kitchen): kitchen is KitchenCollectionDoc => Boolean(kitchen))
  )
  const count = computed(() => kitchens.value.length)
  const pending = computed(() =>
    rootSource.value === undefined ||
    (shouldHydrate.value && placeSource.value === undefined)
  )

  return {
    kitchens,
    count,
    pending,
  }
}
