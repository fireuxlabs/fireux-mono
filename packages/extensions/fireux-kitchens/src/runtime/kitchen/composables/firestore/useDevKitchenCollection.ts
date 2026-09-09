// Concurrent edit — 2026-07-24 18:12 CEST — Kitchen collection canon: isolate raw Firestore reads behind a dev-only adapter.
import { computed, isRef, type Ref } from 'vue'
import { type Place } from 'fireux-places/runtime/place/models/place.model'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeSimulationFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { KitchenSurface } from '../../models/kitchen-interface.model'
import { useKitchenInterface } from '../useKitchenInterface'
import type { KitchenReadSource } from './useKitchenRead'

type KitchenCollectionDoc = KitchenSurface
type KitchenCollectionFilterValue = string | number | null | undefined
export type KitchenCollectionFilter = {
  ids?: KitchenCollectionFilterValue[] | null | undefined
  operatorId?: KitchenCollectionFilterValue
  teamId?: KitchenCollectionFilterValue
}

type UseDevKitchenCollectionOptions = {
  ids?: string[] | Ref<string[] | null | undefined>
  source?: KitchenReadSource | Ref<KitchenReadSource>
  filter?:
    | KitchenCollectionFilter
    | Ref<KitchenCollectionFilter | null | undefined>
}

const normalize = (value: unknown) => String(value ?? '').trim()
const normalizeSource = (value: unknown): KitchenReadSource => {
  const source = normalize(value)
  if (source === 'demo' || source === 'test') return source
  return 'live'
}

/**
 * Raw root/scoped Kitchen collection adapter.
 *
 * Workspace and exact-target development reads use this Firestore adapter.
 */
export function useDevKitchenCollection(
  options: UseDevKitchenCollectionOptions = {}
) {
  const { surface } = useKitchenInterface()
  const liveRead = useFirestoreRead()
  const sourceRef = computed<KitchenReadSource>(() =>
    normalizeSource(
      isRef(options.source) ? options.source.value : options.source
    )
  )
  const resolvedFilter = computed<KitchenCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const simulationDatabaseId = computed(() =>
    sourceRef.value === 'test'
      ? readRuntimeSimulationFirestoreDatabaseId() || ''
      : ''
  )
  const simulationRead = useFirestoreRead({ databaseId: simulationDatabaseId })
  const idSet = computed(() => {
    const ids = isRef(options.ids) ? options.ids.value : options.ids
    return new Set(
      [...(ids ?? []), ...(resolvedFilter.value?.ids ?? [])]
        .map((id) => normalize(id))
        .filter(Boolean)
    )
  })
  const hasIdFilter = computed(() => {
    const ids = isRef(options.ids) ? options.ids.value : options.ids
    return Array.isArray(ids) || Array.isArray(resolvedFilter.value?.ids)
  })
  const idList = computed(() => Array.from(idSet.value))
  const rootCollectionPath = computed(() =>
    sourceRef.value === 'live' && !hasIdFilter.value ? 'kitchens' : ''
  )
  const testCollectionPath = computed(() =>
    sourceRef.value === 'test' &&
    !hasIdFilter.value &&
    simulationDatabaseId.value
      ? 'kitchens'
      : ''
  )
  const rootSource =
    liveRead.firestoreFetchCollection<KitchenCollectionDoc>(rootCollectionPath)
  const exactRootSource = liveRead.firestoreLoadDocsByIds<KitchenCollectionDoc>(
    {
      collectionPath: computed(() =>
        sourceRef.value === 'live' && hasIdFilter.value ? 'kitchens' : ''
      ),
      ids: idList,
    }
  )
  const testSource =
    simulationRead.firestoreFetchCollection<KitchenCollectionDoc>(
      testCollectionPath
    )
  const exactTestSource =
    simulationRead.firestoreLoadDocsByIds<KitchenCollectionDoc>({
      collectionPath: computed(() =>
        sourceRef.value === 'test' &&
        hasIdFilter.value &&
        simulationDatabaseId.value
          ? 'kitchens'
          : ''
      ),
      ids: idList,
    })
  const rootDocs = computed<KitchenCollectionDoc[]>(() =>
    sourceRef.value === 'demo'
      ? []
      : sourceRef.value === 'test'
        ? hasIdFilter.value
          ? (exactTestSource.docs.value ?? [])
          : (testSource.value ?? [])
        : hasIdFilter.value
          ? (exactRootSource.docs.value ?? [])
          : (rootSource.value ?? [])
  )
  const testPlaceIds = computed(() =>
    sourceRef.value === 'test'
      ? rootDocs.value.map((kitchen) => normalize(kitchen.id)).filter(Boolean)
      : []
  )
  const exactTestPlaceSource = simulationRead.firestoreLoadDocsByIds<Place>({
    collectionPath: computed(() =>
      sourceRef.value === 'test' && simulationDatabaseId.value ? 'places' : ''
    ),
    ids: testPlaceIds,
  })
  const testPlacesById = computed(
    () =>
      new Map(
        (exactTestPlaceSource.docs.value ?? [])
          .map((place) => [normalize(place.id), place] as const)
          .filter(([id]) => Boolean(id))
      )
  )
  const testPairError = computed<Error | undefined>(() => {
    if (
      sourceRef.value !== 'test' ||
      exactTestPlaceSource.pending.value ||
      exactTestPlaceSource.error.value
    ) {
      return undefined
    }
    const invalid = rootDocs.value.find((kitchen) => {
      const placeId = normalize(kitchen.id)
      return !placeId || !testPlacesById.value.has(placeId)
    })
    return invalid
      ? new Error(
          `Test Kitchen ${normalize(invalid.id) || '(unknown)'} is missing its canonical Place.`
        )
      : undefined
  })
  const kitchens = computed<KitchenCollectionDoc[]>(
    () =>
      rootDocs.value
        .map((kitchen) => {
          const id = normalize(kitchen?.id)
          if (!id) return null
          if (hasIdFilter.value && !idSet.value.has(id)) return null
          const testPlace =
            sourceRef.value === 'test'
              ? (testPlacesById.value.get(normalize(kitchen.id)) ?? null)
              : null
          if (sourceRef.value === 'test' && !testPlace) return null

          return surface({
            place: testPlace,
            kitchen: {
              ...kitchen,
              id,
            },
            routeScope:
              sourceRef.value === 'demo' || sourceRef.value === 'test'
                ? sourceRef.value
                : kitchen.route_scope,
          })
        })
        .filter(Boolean) as KitchenCollectionDoc[]
  )
  const count = computed(() => kitchens.value.length)
  const active = computed(
    () =>
      sourceRef.value !== 'demo' &&
      (sourceRef.value !== 'test' || Boolean(simulationDatabaseId.value))
  )
  const pending = computed(() => {
    if (sourceRef.value === 'demo') return false
    if (sourceRef.value === 'test' && !simulationDatabaseId.value) return false
    const rootPending = hasIdFilter.value
      ? sourceRef.value === 'test'
        ? exactTestSource.pending.value
        : exactRootSource.pending.value
      : sourceRef.value === 'test'
        ? testSource.pending.value
        : rootSource.pending.value
    return (
      rootPending ||
      (sourceRef.value === 'test' && exactTestPlaceSource.pending.value)
    )
  })
  const error = computed<unknown | undefined>(() => {
    if (sourceRef.value === 'demo') return undefined
    if (sourceRef.value === 'test' && !simulationDatabaseId.value) {
      return undefined
    }
    if (hasIdFilter.value) {
      return sourceRef.value === 'test'
        ? (exactTestSource.error.value ??
            exactTestPlaceSource.error.value ??
            testPairError.value)
        : exactRootSource.error.value
    }
    return sourceRef.value === 'test'
      ? (testSource.error.value ??
          exactTestPlaceSource.error.value ??
          testPairError.value)
      : rootSource.error.value
  })
  const { outcome } = useFirestoreCollectionState({
    active,
    count,
    error,
    pending,
  })

  return {
    kitchens,
    count,
    pending,
    error,
    outcome,
  }
}
