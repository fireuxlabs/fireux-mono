import { computed, isRef, type Ref } from 'vue'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Kitchen } from '../../../../../models/kitchen.model'

type KitchenCollectionDoc = Partial<Kitchen> & { id?: string; place_id?: string }

type UseKitchenCollectionOptions = {
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'kitchens'

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

export function useKitchenCollection(options: UseKitchenCollectionOptions = {}) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const pathRef = isRef(options.collectionPath)
    ? options.collectionPath
    : computed(() => String(options.collectionPath || DEFAULT_COLLECTION_PATH).trim())
  const shouldHydrate = options.hydrate !== false

  const source = computed(() => {
    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    return firestoreFetchCollection<KitchenCollectionDoc>(collectionPath)
  })

  const placesSource = computed(() => {
    if (!shouldHydrate) return null
    return firestoreFetchCollection<Place>('places')
  })

  const kitchens = computed(() => {
    const placesById = new Map<string, Place>()
    for (const place of placesSource.value?.value ?? []) {
      const placeId = String(place?.id || '').trim()
      if (placeId) placesById.set(placeId, place)
    }

    return (source.value?.value ?? [])
      .map((kitchen) => {
        const kitchenId = String(kitchen?.id || '').trim()
        const resolvedPlaceId = String(kitchen?.place_id || kitchenId).trim()
        const place = shouldHydrate ? placesById.get(resolvedPlaceId) ?? null : null

        return {
          ...pickPlaceForKitchen(place),
          ...kitchen,
          id: kitchenId,
        }
      })
      .filter((kitchen) => Boolean(kitchen.id))
  })

  const count = computed(() => kitchens.value.length)
  const pending = computed(() => source.value?.value === undefined)

  return {
    kitchens,
    count,
    pending,
  }
}
