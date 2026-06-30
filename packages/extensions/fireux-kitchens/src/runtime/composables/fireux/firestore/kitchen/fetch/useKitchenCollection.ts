import { computed, isRef, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeSimulationFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { getDemoKitchens } from '../../../demo/kitchen/scenarios'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import type { KitchenSurface } from '../utils/view/useKitchenInterface'
import { useKitchenInterface } from '../utils/view/useKitchenInterface'
import type { KitchenFetchSource } from './useKitchenFetch'

type KitchenCollectionDoc = KitchenSurface

type UseKitchenCollectionOptions = {
  ids?: string[] | Ref<string[] | null | undefined>
  source?: KitchenFetchSource | Ref<KitchenFetchSource>
}

const normalize = (value: unknown) => String(value ?? '').trim()
const normalizeSource = (value: unknown): KitchenFetchSource => {
  const source = normalize(value)
  if (source === 'demo' || source === 'test') return source
  return 'live'
}

/**
 * Public root Kitchen collection seam.
 *
 * Reads `kitchens/{kitchenId}` only. App-scoped operator records belong to
 * console/operator seams, not this collection.
 */
export function useKitchenCollection(options: UseKitchenCollectionOptions = {}) {
  const { surface } = useKitchenInterface()
  const liveRead = useFirestoreRead()
  const sourceRef = computed<KitchenFetchSource>(() =>
    normalizeSource(isRef(options.source) ? options.source.value : options.source)
  )
  const simulationDatabaseId = computed(() =>
    sourceRef.value === 'test'
      ? readRuntimeSimulationFirestoreDatabaseId() || ''
      : ''
  )
  const simulationRead = useFirestoreRead({ databaseId: simulationDatabaseId })
  const idSet = computed(() => {
    const ids = isRef(options.ids) ? options.ids.value : options.ids
    return new Set((ids ?? []).map((id) => normalize(id)).filter(Boolean))
  })
  const hasIdFilter = computed(() => {
    const ids = isRef(options.ids) ? options.ids.value : options.ids
    return Array.isArray(ids)
  })
  const idList = computed(() => Array.from(idSet.value))
  const rootCollectionPath = computed(() =>
    sourceRef.value === 'live' && !hasIdFilter.value
      ? KitchenStorage.rootCollection
      : ''
  )
  const testCollectionPath = computed(() =>
    sourceRef.value === 'test' &&
      !hasIdFilter.value &&
      simulationDatabaseId.value
      ? KitchenStorage.rootCollection
      : ''
  )
  const rootSource = liveRead.firestoreFetchCollection<KitchenCollectionDoc>(
    rootCollectionPath
  )
  const exactRootSource = liveRead.firestoreLoadDocsByIds<KitchenCollectionDoc>({
    collectionPath: computed(() =>
      sourceRef.value === 'live' && hasIdFilter.value
        ? KitchenStorage.rootCollection
        : ''
    ),
    ids: idList,
  })
  const testSource = simulationRead.firestoreFetchCollection<KitchenCollectionDoc>(
    testCollectionPath
  )
  const exactTestSource = simulationRead.firestoreLoadDocsByIds<KitchenCollectionDoc>({
    collectionPath: computed(() =>
      sourceRef.value === 'test' &&
        hasIdFilter.value &&
        simulationDatabaseId.value
        ? KitchenStorage.rootCollection
        : ''
    ),
    ids: idList,
  })
  const demoDocs = computed<KitchenCollectionDoc[]>(() =>
    getDemoKitchens().map((kitchen) => ({
      id: kitchen.id,
      place_id: kitchen.id,
      slug: kitchen.slug,
      name: kitchen.name,
      display_name: kitchen.name,
      tagline: kitchen.label,
      short_name: kitchen.short_name || kitchen.label,
      short_address: kitchen.short_address,
      formatted_address: kitchen.formatted_address,
      image_url: kitchen.image_url,
      display_image_url: kitchen.image_url,
      route_scope: 'demo',
      is_test_kitchen: false,
    }))
  )
  const rootDocs = computed<KitchenCollectionDoc[]>(() =>
    sourceRef.value === 'demo'
      ? demoDocs.value
      : sourceRef.value === 'test'
        ? hasIdFilter.value
          ? exactTestSource.docs.value ?? []
          : testSource.value ?? []
        : hasIdFilter.value
          ? exactRootSource.docs.value ?? []
          : rootSource.value ?? []
  )
  const kitchens = computed<KitchenCollectionDoc[]>(() =>
    rootDocs.value
      .map((kitchen) => {
        const id = normalize(kitchen?.id)
        if (!id) return null
        if (hasIdFilter.value && !idSet.value.has(id)) return null

        return surface({
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
  const pending = computed(() => {
    if (sourceRef.value === 'demo') return false
    if (sourceRef.value === 'test' && !simulationDatabaseId.value) return false

    const rootPending = hasIdFilter.value
      ? sourceRef.value === 'test'
        ? exactTestSource.pending.value
        : exactRootSource.pending.value
      : sourceRef.value === 'test'
        ? testSource.value === undefined
        : rootSource.value === undefined
    return rootPending
  })

  return {
    kitchens,
    count,
    pending,
  }
}
