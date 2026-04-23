import { computed, isRef, type Ref } from 'vue'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { getDemoKitchens } from '../../../app/utils/kitchen-demo-scenarios'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Kitchen } from '../../../../../models/kitchen.model'

type KitchenCollectionDoc = Partial<Kitchen> & { id?: string; place_id?: string }

const DEFAULT_COLLECTION_PATH = 'kitchens'
const TEST_COLLECTION_PATH = 'test-kitchens'
export type KitchenCollectionFilterValue = string | number | null | undefined
export type KitchenCollectionFilter = {
  ids?: KitchenCollectionFilterValue[] | null | undefined
}
export type KitchenCollectionSource = 'live' | 'demo' | 'test'

type UseKitchenCollectionOptions = {
  source?: KitchenCollectionSource | Ref<KitchenCollectionSource | null | undefined> | null
  filter?: KitchenCollectionFilter | Ref<KitchenCollectionFilter | null | undefined> | null
}

function toDemoKitchenSurface(
  kitchen: ReturnType<typeof getDemoKitchens>[number]
): KitchenCollectionDoc {
  const id = String(kitchen.id || '').trim()

  return {
    id,
    slug: id,
    place_id: id,
    name: String(kitchen.name || '').trim(),
    short_address: String(kitchen.label || '').trim(),
    image_url: kitchen.image_url,
  }
}

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

export function useKitchenCollection(
  options: UseKitchenCollectionOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceMode = computed<KitchenCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const resolvedFilter = computed<KitchenCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const hasFilter = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const filterIdSet = computed(
    () =>
      new Set(
        (resolvedFilter.value?.ids ?? [])
          .map((value) => String(value ?? '').trim())
          .filter(Boolean)
      )
  )
  const shouldHydrate = computed(() => sourceMode.value === 'live')

  const demoKitchens = computed<KitchenCollectionDoc[]>(() =>
    getDemoKitchens().map(toDemoKitchenSurface)
  )
  const firestoreSource = computed(() => {
    if (sourceMode.value === 'demo') return null

    const collectionPath =
      sourceMode.value === 'test'
        ? TEST_COLLECTION_PATH
        : DEFAULT_COLLECTION_PATH

    return firestoreFetchCollection<KitchenCollectionDoc>(collectionPath)
  })
  const placesSource = computed(() => {
    if (!shouldHydrate.value) return null
    return firestoreFetchCollection<Place>('places')
  })
  const collectionItems = computed<KitchenCollectionDoc[]>(() => {
    const placesById = new Map<string, Place>()
    for (const place of placesSource.value?.value ?? []) {
      const placeId = String(place?.id || '').trim()
      if (placeId) placesById.set(placeId, place)
    }

    const rootItems =
      sourceMode.value === 'demo'
        ? demoKitchens.value
        : (firestoreSource.value?.value ?? [])

    return rootItems
      .map((kitchen) => {
        const kitchenId = String(kitchen?.id || '').trim()
        if (!kitchenId) return null
        if (hasFilter.value && !filterIdSet.value.has(kitchenId)) return null

        const resolvedPlaceId = String(kitchen?.place_id || kitchenId).trim()
        const place =
          shouldHydrate.value ? placesById.get(resolvedPlaceId) ?? null : null

        return {
          ...pickPlaceForKitchen(place),
          ...kitchen,
          id: kitchenId,
        }
      })
      .filter((kitchen): kitchen is KitchenCollectionDoc => Boolean(kitchen))
  })

  const kitchens = computed<KitchenCollectionDoc[]>(() =>
    collectionItems.value.reduce<KitchenCollectionDoc[]>((acc, kitchen) => {
      const id = String(kitchen?.id || '').trim()
      if (!id) return acc

      acc.push({
        ...kitchen,
        id,
      })

      return acc
    }, [])
  )

  const count = computed(() => kitchens.value.length)
  const pending = computed(() => {
    if (sourceMode.value === 'demo') return false
    return firestoreSource.value?.value === undefined
  })

  return {
    kitchens,
    count,
    pending,
  }
}
