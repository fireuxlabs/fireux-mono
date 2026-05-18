import { computed, isRef, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  readRuntimeSimulationFirestoreDatabaseId,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { getDemoKitchen } from '../../../app/utils/kitchen-demo-scenarios'
import type { Kitchen } from '../../../../../models/kitchen.model'

export type KitchenFetchDoc = Partial<Kitchen> & {
  id?: string
  route_scope?: 'live' | 'demo' | 'test'
}
export type KitchenFetchSource = 'live' | 'test' | 'demo'

type UseKitchenFetchOptions = {
  source?: KitchenFetchSource | Ref<KitchenFetchSource>
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'kitchens'
const requireSimulationDatabaseId = () => {
  const databaseId = readRuntimeSimulationFirestoreDatabaseId()
  if (!databaseId) {
    throw new Error(
      'Missing firebase.simulationDatabaseId for kitchen test-mode reads.'
    )
  }
  return databaseId
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

export function useKitchenFetch(
  id: string | Ref<string>,
  options: UseKitchenFetchOptions = {}
) {
  const simulationDatabaseId = computed(
    () => requireSimulationDatabaseId()
  )
  const liveRead = useFirestoreRead()
  const simulationRead = useFirestoreRead({ databaseId: simulationDatabaseId })
  const idRef = isRef(id) ? id : computed(() => String(id || '').trim())
  const sourceRef = computed<KitchenFetchSource>(
    () => (isRef(options.source) ? options.source.value : options.source) ?? 'live'
  )
  const pathRef = computed(() => {
    const configuredPath = isRef(options.collectionPath)
      ? options.collectionPath.value
      : options.collectionPath

    const explicitPath = String(configuredPath || '').trim()
    if (explicitPath) return explicitPath
    return DEFAULT_COLLECTION_PATH
  })
  const shouldHydrate = options.hydrate !== false

  const source = shallowRef(null) as ShallowRef<Ref<KitchenFetchDoc | undefined> | null>
  watch(
    [sourceRef, pathRef, idRef],
    ([nextSource, nextPath, nextId]) => {
      const collectionPath = String(nextPath || '').trim() || DEFAULT_COLLECTION_PATH
      const docId = String(nextId || '').trim()

      if (!docId) {
        source.value = null
        return
      }

      if (nextSource === 'demo') {
        source.value = computed<KitchenFetchDoc | undefined>(() => {
          const scenario = getDemoKitchen(docId)
          if (!scenario) return undefined

          return {
            id: scenario.id,
            place_id: scenario.id,
            name: scenario.name,
            short_address: scenario.label,
            image_url: scenario.image_url,
            route_scope: 'demo',
          } as KitchenFetchDoc
        })
        return
      }

      source.value =
        nextSource === 'test'
          ? simulationRead.firestoreFetchDoc<KitchenFetchDoc>(collectionPath, docId)
          : liveRead.firestoreFetchDoc<KitchenFetchDoc>(collectionPath, docId)
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
    [placeId, sourceRef],
    ([nextPlaceId, nextSource]) => {
      const resolvedPlaceId = String(nextPlaceId || '').trim()
      placeSource.value =
        !shouldHydrate || nextSource !== 'live' || !resolvedPlaceId
          ? null
          : liveRead.firestoreFetchDoc<Place>('places', resolvedPlaceId)
    },
    { immediate: true }
  )

  const kitchen = computed<KitchenFetchDoc | null>(() => {
    const docId = String(idRef.value || '').trim()
    const entry = source.value?.value
    if (!docId || !entry) return null

    const place = shouldHydrate ? placeSource.value?.value ?? null : null

    return {
      ...pickPlaceForKitchen(place),
      ...entry,
      id: String(entry?.id || docId).trim(),
      route_scope:
        sourceRef.value === 'demo' || sourceRef.value === 'test'
          ? sourceRef.value
          : (entry as any)?.route_scope,
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
