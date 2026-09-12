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
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Kitchen } from '../../models/kitchen.model.ts'
import { useKitchenInterface } from '../useKitchenInterface'
import type { KitchenSurface } from '../../models/kitchen-interface.model'

export type KitchenReadDoc = Partial<Kitchen>

type UseKitchenReadOptions = {
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'kitchens'

export function useKitchenRead(
  id: string | Ref<string>,
  options: UseKitchenReadOptions = {}
) {
  const { surface } = useKitchenInterface()
  const resolveDb = useFirestoreResolver()
  const read = useFirestoreRead()
  const idRef = isRef(id) ? id : computed(() => String(id || '').trim())
  const pathRef = computed(() => {
    const configuredPath = isRef(options.collectionPath)
      ? options.collectionPath.value
      : options.collectionPath

    const explicitPath = String(configuredPath || '').trim()
    if (explicitPath) return explicitPath
    return DEFAULT_COLLECTION_PATH
  })
  const shouldHydrate = options.hydrate !== false

  const kitchenQuery = computed<Query<KitchenReadDoc> | null>(() => {
    const collectionPath =
      String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    const docId = String(idRef.value || '').trim()
    if (!docId) return null

    return fsq(
      collection(resolveDb(), collectionPath),
      where(documentId(), '==', docId),
      limit(1)
    ) as Query<KitchenReadDoc>
  })
  const kitchenSource = read.firestoreQuery<KitchenReadDoc>(
    kitchenQuery,
    'kitchen-fetch-live',
    pathRef
  )
  const sourceEntry = computed(() => kitchenSource.value?.[0])

  const placeId = computed(() => {
    const entry = sourceEntry.value
    return String(entry?.id || '').trim()
  })
  const placeQuery = computed<Query<Place> | null>(() => {
    const resolvedPlaceId = String(placeId.value || '').trim()
    if (!shouldHydrate || !resolvedPlaceId) return null

    return fsq(
      collection(resolveDb(), 'places'),
      where(documentId(), '==', resolvedPlaceId),
      limit(1)
    ) as Query<Place>
  })
  const placeSource = read.firestoreQuery<Place>(
    placeQuery,
    'kitchen-fetch-place',
    'places'
  )
  const rootKitchen = computed<KitchenReadDoc | null>(() => {
    const docId = String(idRef.value || '').trim()
    const entry = sourceEntry.value
    if (!docId || !entry || String(entry.id || '').trim() !== docId) return null

    return {
      ...entry,
      id: String(entry.id || docId).trim(),
    }
  })

  const kitchen = computed<KitchenSurface | null>(() => {
    const entry = rootKitchen.value
    if (!entry) return null

    const place = shouldHydrate ? (placeSource.value?.[0] ?? null) : null

    return surface({
      place: place?.id === entry.id ? place : null,
      kitchen: entry,
      routeScope: 'live',
    })
  })

  const pending = computed(() => {
    const docId = String(idRef.value || '').trim()
    if (!docId) return false
    if (
      sourceEntry.value &&
      String(sourceEntry.value.id || '').trim() !== docId
    )
      return true
    return (
      kitchenSource.pending.value ||
      (shouldHydrate && Boolean(placeId.value) && placeSource.pending.value)
    )
  })

  const error = computed(
    () => kitchenSource.error.value ?? placeSource.error.value
  )

  const outcome = computed(() => {
    if (!String(idRef.value || '').trim()) return 'idle' as const
    if (error.value) return 'error' as const
    if (pending.value) return 'pending' as const
    return kitchen.value ? ('ready' as const) : ('missing' as const)
  })

  return {
    kitchen,
    rootKitchen,
    pending,
    error,
    outcome,
  }
}
