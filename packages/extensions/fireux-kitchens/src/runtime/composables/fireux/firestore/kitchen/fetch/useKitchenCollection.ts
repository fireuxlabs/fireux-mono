import {
  collection,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { PlaceStorage, type Place } from 'fireux-places/runtime/models/place.model'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  readRuntimeSimulationFirestoreDatabaseId,
  useFirestore,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { getDemoKitchens } from '../../../app/utils/kitchen-demo-scenarios'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import type { KitchenSurface } from '../utils/view/useKitchenInterface'
import { useKitchenInterface } from '../utils/view/useKitchenInterface'

type KitchenCollectionDoc = KitchenSurface
type AppKitchenCollectionDoc = {
  id?: string
  operator_ids?: string[]
  team_ids?: string[]
}

const DEFAULT_COLLECTION_PATH = KitchenStorage.rootCollection
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

export function useKitchenCollection(
  options: UseKitchenCollectionOptions = {}
) {
  const { surface } = useKitchenInterface()
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
  const overlayCollectionPath = computed(() =>
    currentAppId.value
      ? `${AppStorage.collection}/${currentAppId.value}/${KitchenStorage.overlayCollection}`
      : ''
  )
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
  const livePlacesSource = firestoreFetchCollection<Place>(PlaceStorage.collection)
  const liveRootSource = firestoreFetchCollection<KitchenCollectionDoc>(
    DEFAULT_COLLECTION_PATH
  )
  const testFirestoreQuery = computed<Query<KitchenCollectionDoc> | null>(() =>
    simulationDatabaseId.value
      ? fsq(
          collection(resolveSimulationDb(), DEFAULT_COLLECTION_PATH),
          where('simulation_kind', '==', 'test')
        ) as Query<KitchenCollectionDoc>
      : null
  )
  const testFirestoreSource = simulationRead.firestoreQuery<KitchenCollectionDoc>(
    testFirestoreQuery,
    undefined,
    DEFAULT_COLLECTION_PATH
  )

  const firestoreSource = computed(() => {
    if (sourceMode.value === 'demo') return localDemoSource
    if (sourceMode.value === 'test') {
      if (!simulationDatabaseId.value) requireSimulationDatabaseId()
      return testFirestoreSource
    }
    return hasOperatorFilter.value ? liveFirestoreDocs.docs : liveRootSource
  })
  const operatorOverlayQuery = computed<Query<AppKitchenCollectionDoc> | null>(() => {
    if (sourceMode.value !== 'live') return null
    if (!hasOperatorFilter.value || !filterOperatorId.value || !currentAppId.value) {
      return null
    }

    return fsq(
      collection(db, AppStorage.collection, currentAppId.value, KitchenStorage.overlayCollection),
      where('operator_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppKitchenCollectionDoc>
  })
  const operatorOverlaySource = firestoreQuery<AppKitchenCollectionDoc>(
    operatorOverlayQuery,
    undefined,
    overlayCollectionPath
  )
  const teamOverlayQuery = computed<Query<AppKitchenCollectionDoc> | null>(() => {
    if (sourceMode.value !== 'live') return null
    if (!hasOperatorFilter.value || !filterOperatorId.value || !currentAppId.value) {
      return null
    }

    return fsq(
      collection(db, AppStorage.collection, currentAppId.value, KitchenStorage.overlayCollection),
      where('team_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppKitchenCollectionDoc>
  })
  const teamOverlaySource = firestoreQuery<AppKitchenCollectionDoc>(
    teamOverlayQuery,
    undefined,
    overlayCollectionPath
  )
  const overlayItems = computed<AppKitchenCollectionDoc[]>(() => {
    const overlaysById = new Map<string, AppKitchenCollectionDoc>()

    for (const overlay of [
      ...(operatorOverlaySource.value ?? []),
      ...(teamOverlaySource.value ?? []),
    ]) {
      const id = String(overlay?.id || '').trim()
      if (!id) continue

      overlaysById.set(id, {
        ...overlaysById.get(id),
        ...overlay,
        id,
        operator_ids: Array.from(
          new Set([
            ...(overlaysById.get(id)?.operator_ids ?? []),
            ...(overlay.operator_ids ?? []),
          ])
        ),
        team_ids: Array.from(
          new Set([
            ...(overlaysById.get(id)?.team_ids ?? []),
            ...(overlay.team_ids ?? []),
          ])
        ),
      })
    }

    return Array.from(overlaysById.values())
  })
  const overlaysByKitchenId = computed(() => {
    const map = new Map<string, AppKitchenCollectionDoc>()

    for (const overlay of overlayItems.value) {
      const id = String(overlay?.id || '').trim()
      if (id) map.set(id, overlay)
    }

    return map
  })
  const allowedKitchenIds = computed(() =>
    overlayItems.value
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

        return surface({
          place,
          kitchen: {
            ...kitchen,
            id: kitchenId,
          },
          overlay: overlaysByKitchenId.value.get(kitchenId) ?? null,
          routeScope:
            sourceMode.value === 'demo' || sourceMode.value === 'test'
              ? sourceMode.value
              : kitchen.route_scope,
        })
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
    if (
      hasOperatorFilter.value &&
      currentAppId.value &&
      (
        operatorOverlaySource.value === undefined ||
        teamOverlaySource.value === undefined
      )
    ) {
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
