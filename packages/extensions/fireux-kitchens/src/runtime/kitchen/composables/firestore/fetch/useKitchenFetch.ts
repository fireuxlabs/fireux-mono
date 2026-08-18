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
import { PlaceStorage, type Place } from 'fireux-places/runtime/place/models/place.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  readRuntimeSimulationFirestoreDatabaseId,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { KitchenStorage, type Kitchen } from '../../../models/kitchen.model.ts'
import { useKitchenInterface } from '../utils/view/useKitchenInterface'

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

const DEFAULT_COLLECTION_PATH = KitchenStorage.collection
const requireSimulationDatabaseId = () => {
  const databaseId = readRuntimeSimulationFirestoreDatabaseId()
  if (!databaseId) {
    throw new Error(
      'Missing firebase.simulationDatabaseId for kitchen test-mode reads.'
    )
  }
  return databaseId
}

export function useKitchenFetch(
  id: string | Ref<string>,
  options: UseKitchenFetchOptions = {}
) {
  const { surface } = useKitchenInterface()
  const simulationDatabaseId = computed(
    () => requireSimulationDatabaseId()
  )
  const resolveLiveDb = useFirestoreResolver()
  const resolveSimulationDb = useFirestoreResolver(simulationDatabaseId)
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

  const liveDocQuery = computed<Query<KitchenFetchDoc> | null>(() => {
    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    const docId = String(idRef.value || '').trim()
    if (sourceRef.value !== 'live' || !docId) return null

    return fsq(
      collection(resolveLiveDb(), collectionPath),
      where(documentId(), '==', docId),
      limit(1)
    ) as Query<KitchenFetchDoc>
  })
  const testDocQuery = computed<Query<KitchenFetchDoc> | null>(() => {
    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    const docId = String(idRef.value || '').trim()
    if (sourceRef.value !== 'test' || !docId) return null

    return fsq(
      collection(resolveSimulationDb(), collectionPath),
      where(documentId(), '==', docId),
      limit(1)
    ) as Query<KitchenFetchDoc>
  })
  const liveSource = liveRead.firestoreQuery<KitchenFetchDoc>(
    liveDocQuery,
    'kitchen-fetch-live',
    pathRef
  )
  const testSource = simulationRead.firestoreQuery<KitchenFetchDoc>(
    testDocQuery,
    'kitchen-fetch-test',
    pathRef
  )
  const sourceEntry = computed<KitchenFetchDoc | undefined>(() => {
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
    if (!shouldHydrate || sourceRef.value !== 'live' || !resolvedPlaceId) return null

    return fsq(
      collection(resolveLiveDb(), PlaceStorage.collection),
      where(documentId(), '==', resolvedPlaceId),
      limit(1)
    ) as Query<Place>
  })
  const placeSource = liveRead.firestoreQuery<Place>(
    placeQuery,
    'kitchen-fetch-place',
    PlaceStorage.collection
  )
  const testPlaceQuery = computed<Query<Place> | null>(() => {
    const resolvedPlaceId = String(placeId.value || '').trim()
    if (!shouldHydrate || sourceRef.value !== 'test' || !resolvedPlaceId) return null

    return fsq(
      collection(resolveSimulationDb(), PlaceStorage.collection),
      where(documentId(), '==', resolvedPlaceId),
      limit(1)
    ) as Query<Place>
  })
  const testPlaceSource = simulationRead.firestoreQuery<Place>(
    testPlaceQuery,
    'kitchen-fetch-test-place',
    PlaceStorage.collection
  )
  const rootKitchen = computed<KitchenFetchDoc | null>(() => {
    const docId = String(idRef.value || '').trim()
    const entry = sourceEntry.value
    if (!docId || !entry) return null

    return {
      ...entry,
      id: String(entry.id || docId).trim(),
    }
  })

  const kitchen = computed<KitchenFetchDoc | null>(() => {
    const entry = rootKitchen.value
    if (!entry) return null

    const place = shouldHydrate
      ? sourceRef.value === 'test'
        ? testPlaceSource.value?.[0] ?? null
        : placeSource.value?.[0] ?? null
      : null

    return surface({
      place,
      kitchen: entry,
      routeScope:
        sourceRef.value === 'demo' || sourceRef.value === 'test'
          ? sourceRef.value
          : (entry as any)?.route_scope,
    }) as KitchenFetchDoc | null
  })

  const pending = computed(() => {
    const docId = String(idRef.value || '').trim()
    if (sourceRef.value === 'demo') return false
    if (!docId) return false
    if (sourceRef.value === 'test') {
      return testSource.value === undefined ||
        (shouldHydrate && Boolean(placeId.value) &&
          testPlaceSource.value === undefined)
    }
    return liveSource.value === undefined
  })

  return {
    kitchen,
    rootKitchen,
    pending,
  }
}
