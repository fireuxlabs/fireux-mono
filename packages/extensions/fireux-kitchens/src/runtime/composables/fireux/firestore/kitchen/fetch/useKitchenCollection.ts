import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { getDemoKitchens } from '../../../app/utils/kitchen-demo-scenarios'
import {
  normalizeFirestoreCollectionItems,
  useFirestoreCollectionFilter,
  useFirestoreCollectionModes,
  type FirestoreCollectionOptions,
} from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Kitchen } from '../../../../../models/kitchen.model'

type KitchenCollectionDoc = Partial<Kitchen> & { id?: string; place_id?: string }

const DEFAULT_COLLECTION_PATH = 'kitchens'
const TEST_COLLECTION_PATH = 'test-kitchens'

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

export function useKitchenCollection(options: FirestoreCollectionOptions = {}) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const { sourceMode, collectionPath } = useFirestoreCollectionModes({
    ...options,
    defaultCollectionPath: DEFAULT_COLLECTION_PATH,
    testCollectionPath: TEST_COLLECTION_PATH,
  })
  const { hasFilter, filterIdSet } = useFirestoreCollectionFilter(options.filter)
  const shouldHydrate = computed(() => sourceMode.value === 'live')

  const rootSource = shallowRef(null) as ShallowRef<
    Ref<KitchenCollectionDoc[] | undefined> | null
  >
  watch(
    [sourceMode, collectionPath],
    ([nextSourceMode, nextCollectionPath]) => {
      rootSource.value =
        nextSourceMode === 'demo'
          ? null
          : firestoreFetchCollection<KitchenCollectionDoc>(nextCollectionPath)
    },
    { immediate: true }
  )

  const placesSource = shallowRef(null) as ShallowRef<Ref<Place[] | undefined> | null>
  watch(
    shouldHydrate,
    (nextShouldHydrate) => {
      placesSource.value = nextShouldHydrate
        ? firestoreFetchCollection<Place>('places')
        : null
    },
    { immediate: true }
  )

  const demoKitchens = computed<KitchenCollectionDoc[]>(() =>
    getDemoKitchens().map(toDemoKitchenSurface)
  )
  const collectionItems = computed(() => {
    if (sourceMode.value === 'demo') {
      return demoKitchens.value
    }

    const placesById = new Map<string, Place>()
    for (const place of placesSource.value?.value ?? []) {
      const placeId = String(place?.id || '').trim()
      if (placeId) placesById.set(placeId, place)
    }

    return (rootSource.value?.value ?? [])
      .filter((kitchen) => {
        const kitchenId = String(kitchen?.id || '').trim()
        if (!kitchenId) return false
        if (!hasFilter.value) return true
        return filterIdSet.value.has(kitchenId)
      })
      .map((kitchen) => {
        const kitchenId = String(kitchen?.id || '').trim()
        const resolvedPlaceId = String(kitchen?.place_id || kitchenId).trim()
        const place = shouldHydrate.value ? placesById.get(resolvedPlaceId) ?? null : null

        return {
          ...pickPlaceForKitchen(place),
          ...kitchen,
        }
      })
  })

  const kitchens = computed(() =>
    normalizeFirestoreCollectionItems(collectionItems.value, (kitchen) => ({
      ...kitchen,
    }))
  )

  const count = computed(() => kitchens.value.length)
  const pending = computed(() =>
    sourceMode.value === 'demo' ? false : rootSource.value?.value === undefined
  )

  return {
    kitchens,
    count,
    pending,
  }
}
