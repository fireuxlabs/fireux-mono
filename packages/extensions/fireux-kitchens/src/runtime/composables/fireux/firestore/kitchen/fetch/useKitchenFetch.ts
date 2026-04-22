import { computed, isRef, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { getDemoKitchens } from '../../../app/utils/kitchen-demo-scenarios'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Kitchen } from '../../../../../models/kitchen.model'

type KitchenFetchDoc = Partial<Kitchen> & { id?: string }
export type KitchenFetchSource = 'live' | 'test' | 'demo'

type UseKitchenFetchOptions = {
  source?: KitchenFetchSource | Ref<KitchenFetchSource>
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'kitchens'
const TEST_COLLECTION_PATH = 'test-kitchens'

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

export function useKitchenFetch(
  id: string | Ref<string>,
  options: UseKitchenFetchOptions = {}
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const idRef = isRef(id) ? id : computed(() => String(id || '').trim())
  const sourceRef = isRef(options.source)
    ? options.source
    : computed<KitchenFetchSource>(() => options.source || 'live')
  const pathRef = computed(() => {
    const configuredPath = isRef(options.collectionPath)
      ? options.collectionPath.value
      : options.collectionPath

    const explicitPath = String(configuredPath || '').trim()
    if (explicitPath) return explicitPath
    return sourceRef.value === 'test' ? TEST_COLLECTION_PATH : DEFAULT_COLLECTION_PATH
  })
  const shouldHydrate = options.hydrate !== false

  const source = shallowRef(null) as ShallowRef<Ref<KitchenFetchDoc | undefined> | null>
  watch(
    [sourceRef, pathRef, idRef],
    ([nextSource, nextPath, nextId]) => {
      const collectionPath = String(nextPath || '').trim() || DEFAULT_COLLECTION_PATH
      const docId = String(nextId || '').trim()

      source.value =
        nextSource === 'demo' || !docId
          ? null
          : firestoreFetchDoc<KitchenFetchDoc>(collectionPath, docId)
    },
    { immediate: true }
  )

  const placeId = computed(() => {
    const docId = String(idRef.value || '').trim()
    const entry = source.value?.value
    return String(entry?.place_id || docId).trim()
  })

  const placeSource = shallowRef(null) as ShallowRef<Ref<Place | undefined> | null>
  watch(
    placeId,
    (nextPlaceId) => {
      const resolvedPlaceId = String(nextPlaceId || '').trim()
      placeSource.value =
        !shouldHydrate || !resolvedPlaceId
          ? null
          : firestoreFetchDoc<Place>('places', resolvedPlaceId)
    },
    { immediate: true }
  )

  const kitchen = computed<KitchenFetchDoc | null>(() => {
    const docId = String(idRef.value || '').trim()
    if (sourceRef.value === 'demo') {
      const demoKitchen = getDemoKitchens().find((entry) => String(entry.id || '').trim() === docId)
      if (!demoKitchen) return null

      return {
        id: demoKitchen.id,
        slug: demoKitchen.id,
        place_id: demoKitchen.id,
        name: demoKitchen.name,
        short_address: demoKitchen.label,
        image_url: demoKitchen.image_url,
      }
    }

    const entry = source.value?.value
    if (!docId || !entry) return null

    const place = shouldHydrate ? placeSource.value?.value ?? null : null

    return {
      ...pickPlaceForKitchen(place),
      ...entry,
      id: String(entry?.id || docId).trim(),
    }
  })

  const pending = computed(() => {
    const docId = String(idRef.value || '').trim()
    if (sourceRef.value === 'demo') return false
    if (!docId) return false
    return source.value?.value === undefined
  })

  return {
    kitchen,
    pending,
  }
}
