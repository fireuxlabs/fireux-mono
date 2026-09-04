// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: keep demo payloads outside the Firestore document seam.
// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: expose raw Kitchen delta separately from its Place-hydrated read surface.
import {
  collection,
  documentId,
  limit,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { type Place } from 'fireux-places/runtime/place/models/place.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  readRuntimeSimulationFirestoreDatabaseId,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Kitchen } from '../../../models/kitchen.model.ts'
import { useKitchenInterface } from '../utils/view/useKitchenInterface'

export type KitchenReadDoc = Partial<Kitchen> & {
  id?: string
  route_scope?: 'live' | 'demo' | 'test'
}
export type KitchenReadSource = 'live' | 'test' | 'demo'

type UseKitchenReadOptions = {
  source?: KitchenReadSource | Ref<KitchenReadSource>
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

export function useKitchenRead(
  id: string | Ref<string>,
  options: UseKitchenReadOptions = {}
) {
  const { surface } = useKitchenInterface()
  const simulationDatabaseId = computed(() => requireSimulationDatabaseId())
  const resolveLiveDb = useFirestoreResolver()
  const resolveSimulationDb = useFirestoreResolver(simulationDatabaseId)
  const liveRead = useFirestoreRead()
  const simulationRead = useFirestoreRead({ databaseId: simulationDatabaseId })
  const idRef = isRef(id) ? id : computed(() => String(id || '').trim())
  const sourceRef = computed<KitchenReadSource>(
    () =>
      (isRef(options.source) ? options.source.value : options.source) ?? 'live'
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

  const liveDocQuery = computed<Query<KitchenReadDoc> | null>(() => {
    const collectionPath =
      String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    const docId = String(idRef.value || '').trim()
    if (sourceRef.value !== 'live' || !docId) return null

    return fsq(
      collection(resolveLiveDb(), collectionPath),
      where(documentId(), '==', docId),
      limit(1)
    ) as Query<KitchenReadDoc>
  })
  const testDocQuery = computed<Query<KitchenReadDoc> | null>(() => {
    const collectionPath =
      String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    const docId = String(idRef.value || '').trim()
    if (sourceRef.value !== 'test' || !docId) return null

    return fsq(
      collection(resolveSimulationDb(), collectionPath),
      where(documentId(), '==', docId),
      limit(1)
    ) as Query<KitchenReadDoc>
  })
  const liveSource = liveRead.firestoreQuery<KitchenReadDoc>(
    liveDocQuery,
    'kitchen-fetch-live',
    pathRef
  )
  const testSource = simulationRead.firestoreQuery<KitchenReadDoc>(
    testDocQuery,
    'kitchen-fetch-test',
    pathRef
  )
  const sourceEntry = computed<KitchenReadDoc | undefined>(() => {
    if (sourceRef.value === 'demo') return undefined

    if (sourceRef.value === 'test') return testSource.value?.[0]
    return liveSource.value?.[0]
  })

  const placeId = computed(() => {
    const entry = sourceEntry.value
    return String(entry?.id || '').trim()
  })
  const placeQuery = computed<Query<Place> | null>(() => {
    const resolvedPlaceId = String(placeId.value || '').trim()
    if (!shouldHydrate || sourceRef.value !== 'live' || !resolvedPlaceId)
      return null

    return fsq(
      collection(resolveLiveDb(), 'places'),
      where(documentId(), '==', resolvedPlaceId),
      limit(1)
    ) as Query<Place>
  })
  const placeSource = liveRead.firestoreQuery<Place>(
    placeQuery,
    'kitchen-fetch-place',
    'places'
  )
  const testPlaceQuery = computed<Query<Place> | null>(() => {
    const resolvedPlaceId = String(placeId.value || '').trim()
    if (!shouldHydrate || sourceRef.value !== 'test' || !resolvedPlaceId)
      return null

    return fsq(
      collection(resolveSimulationDb(), 'places'),
      where(documentId(), '==', resolvedPlaceId),
      limit(1)
    ) as Query<Place>
  })
  const testPlaceSource = simulationRead.firestoreQuery<Place>(
    testPlaceQuery,
    'kitchen-fetch-test-place',
    'places'
  )
  const rootKitchen = computed<KitchenReadDoc | null>(() => {
    const docId = String(idRef.value || '').trim()
    const entry = sourceEntry.value
    if (!docId || !entry) return null

    return {
      ...entry,
      id: String(entry.id || docId).trim(),
    }
  })

  const kitchen = computed<KitchenReadDoc | null>(() => {
    const entry = rootKitchen.value
    if (!entry) return null

    const place = shouldHydrate
      ? sourceRef.value === 'test'
        ? (testPlaceSource.value?.[0] ?? null)
        : (placeSource.value?.[0] ?? null)
      : null

    return surface({
      place,
      kitchen: entry,
      routeScope:
        sourceRef.value === 'demo' || sourceRef.value === 'test'
          ? sourceRef.value
          : (entry as any)?.route_scope,
    }) as KitchenReadDoc | null
  })

  const pending = computed(() => {
    const docId = String(idRef.value || '').trim()
    if (sourceRef.value === 'demo') return false
    if (!docId) return false
    if (sourceRef.value === 'test') {
      return (
        testSource.value === undefined ||
        (shouldHydrate &&
          Boolean(placeId.value) &&
          testPlaceSource.value === undefined)
      )
    }
    return liveSource.value === undefined
  })

  return {
    kitchen,
    rootKitchen,
    pending,
  }
}
