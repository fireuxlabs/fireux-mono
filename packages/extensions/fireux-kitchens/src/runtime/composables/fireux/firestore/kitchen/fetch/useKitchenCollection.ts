import {
  collection,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, ref, type Ref } from 'vue'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  readRuntimeSimulationFirestoreDatabaseId,
  useFirestore,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { getDemoKitchens } from '../../../app/utils/kitchen-demo-scenarios'
import type { KitchenSurface } from '../utils/view/useKitchenInterface'

type KitchenCollectionDoc = KitchenSurface
type AppKitchenCollectionDoc = {
  id?: string
  operator_ids?: string[]
  team_ids?: string[]
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
export type KitchenCollectionFilterValue = string | number | null | undefined
export type KitchenCollectionFilter = {
  ids?: KitchenCollectionFilterValue[] | null | undefined
  operatorId?: KitchenCollectionFilterValue
  teamId?: KitchenCollectionFilterValue
}
export type KitchenCollectionSource = 'live' | 'demo' | 'test'

type UseKitchenCollectionOptions = {
  source?: KitchenCollectionSource | Ref<KitchenCollectionSource | null | undefined> | null
  filter?: KitchenCollectionFilter | Ref<KitchenCollectionFilter | null | undefined> | null
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
  const db = useFirestore()
  const simulationDatabaseId = computed(
    () => readRuntimeSimulationFirestoreDatabaseId() || ''
  )
  const resolveSimulationDb = useFirestoreResolver(simulationDatabaseId)
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection, firestoreLoadDocsByIds, firestoreQuery } = useFirestoreRead()
  const simulationRead = useFirestoreRead({ databaseId: simulationDatabaseId })
  const sourceMode = computed<KitchenCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const resolvedFilter = computed<KitchenCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const currentAppId = computed(() => String(appId || '').trim())
  const hasFilter = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const filterOperatorId = computed(() =>
    String(resolvedFilter.value?.operatorId ?? resolvedFilter.value?.teamId ?? '').trim()
  )
  const hasOperatorFilter = computed(() =>
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'operatorId') ||
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'teamId')
  )
  const filterIdSet = computed(
    () =>
      new Set(
        (resolvedFilter.value?.ids ?? [])
          .map((value) => String(value ?? '').trim())
          .filter(Boolean)
      )
  )
  const shouldHydrate = computed(() => sourceMode.value === 'live')
  const localDemoSource = computed<KitchenCollectionDoc[]>(() =>
    getDemoKitchens().map((kitchen) => ({
      ...kitchen,
      short_address: kitchen.label,
      route_scope: 'demo',
    }))
  )
  const livePlacesSource = firestoreFetchCollection<Place>('places')
  const liveRootSource = firestoreFetchCollection<KitchenCollectionDoc>(
    DEFAULT_COLLECTION_PATH
  )
  const testFirestoreSource = simulationDatabaseId.value
    ? (() => {
        const q = fsq(
          collection(resolveSimulationDb(), DEFAULT_COLLECTION_PATH),
          where('simulation_kind', '==', 'test')
        ) as Query<KitchenCollectionDoc>

        return simulationRead.firestoreQuery<KitchenCollectionDoc>(
          q,
          `${simulationDatabaseId.value}-${DEFAULT_COLLECTION_PATH}-test`,
          DEFAULT_COLLECTION_PATH
        )
      })()
    : ref(undefined)

  const firestoreSource = computed(() => {
    if (sourceMode.value === 'demo') return localDemoSource
    if (sourceMode.value === 'test') {
      if (!simulationDatabaseId.value) requireSimulationDatabaseId()
      return testFirestoreSource
    }
    return hasOperatorFilter.value ? liveFirestoreDocs.docs : liveRootSource
  })
  const overlaySource = computed(() => {
    if (sourceMode.value !== 'live') return null
    if (!hasOperatorFilter.value || !filterOperatorId.value || !currentAppId.value) {
      return null
    }

    const q = fsq(
      collection(db, 'apps', currentAppId.value, DEFAULT_COLLECTION_PATH),
      where('operator_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppKitchenCollectionDoc>

    return firestoreQuery<AppKitchenCollectionDoc>(
      q,
      `apps-${currentAppId.value}-${DEFAULT_COLLECTION_PATH}-operator-${filterOperatorId.value}`,
      `apps/${currentAppId.value}/${DEFAULT_COLLECTION_PATH}`
    )
  })
  const allowedKitchenIds = computed(() =>
    (overlaySource.value?.value ?? [])
      .map((kitchen) => String(kitchen?.id || '').trim())
      .filter(Boolean)
  )
  const liveFirestoreDocs = firestoreLoadDocsByIds<KitchenCollectionDoc>({
    collectionPath: DEFAULT_COLLECTION_PATH,
    ids: allowedKitchenIds,
  })
  const placesSource = computed(() => {
    if (!shouldHydrate.value) return null
    return livePlacesSource
  })
  const collectionItems = computed<KitchenCollectionDoc[]>(() => {
    const allowedKitchenIdSet = new Set(allowedKitchenIds.value)
    const placesById = new Map<string, Place>()
    for (const place of placesSource.value?.value ?? []) {
      const placeId = String(place?.id || '').trim()
      if (placeId) placesById.set(placeId, place)
    }

    const rootItems = (firestoreSource.value?.value ?? []) as KitchenCollectionDoc[]

    return rootItems
      .map((kitchen) => {
        const kitchenId = String(kitchen?.id || '').trim()
        if (!kitchenId) return null
        if (hasFilter.value && !filterIdSet.value.has(kitchenId)) return null
        if (hasOperatorFilter.value && !allowedKitchenIdSet.has(kitchenId)) return null

        const resolvedPlaceId = String(kitchen?.place_id || kitchenId).trim()
        const place =
          shouldHydrate.value ? placesById.get(resolvedPlaceId) ?? null : null

        return {
          ...pickPlaceForKitchen(place),
          ...kitchen,
          id: kitchenId,
          route_scope:
            sourceMode.value === 'demo' || sourceMode.value === 'test'
              ? sourceMode.value
              : kitchen.route_scope,
        }
      })
      .filter(Boolean) as KitchenCollectionDoc[]
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
    if (hasOperatorFilter.value && currentAppId.value && overlaySource.value?.value === undefined) {
      return true
    }
    return firestoreSource.value?.value === undefined || liveFirestoreDocs.pending.value
  })

  return {
    kitchens,
    count,
    pending,
  }
}
