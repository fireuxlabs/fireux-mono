// Concurrent edit — 2026-07-24 18:12 CEST — Kitchen collection canon: isolate raw Firestore reads behind a dev-only adapter.
import {
  collection,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import {
  computed,
  isRef,
  type Ref,
} from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'
import { PlaceStorage, type Place } from 'fireux-places/runtime/place/models/place.model'
import { targetHasConsoleAccess } from 'fireux-core/runtime/composables/fireux/console/useConsoleAccess'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  readRuntimeSimulationFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { AppKitchenStorage, KitchenStorage } from '../../../models/kitchen.model.ts'
import type { KitchenSurface } from '../utils/view/useKitchenInterface'
import { useKitchenInterface } from '../utils/view/useKitchenInterface'
import type { KitchenFetchSource } from './useKitchenFetch'
import { composeKitchenScopedSurface } from '../../../utils/kitchen-spine'

type KitchenCollectionDoc = KitchenSurface
type KitchenCollectionFilterValue = string | number | null | undefined
export type KitchenCollectionFilter = {
  ids?: KitchenCollectionFilterValue[] | null | undefined
  operatorId?: KitchenCollectionFilterValue
  teamId?: KitchenCollectionFilterValue
}

type UseDevKitchenCollectionOptions = {
  ids?: string[] | Ref<string[] | null | undefined>
  source?: KitchenFetchSource | Ref<KitchenFetchSource>
  filter?: KitchenCollectionFilter | Ref<KitchenCollectionFilter | null | undefined>
}

const normalize = (value: unknown) => String(value ?? '').trim()
const normalizeSource = (value: unknown): KitchenFetchSource => {
  const source = normalize(value)
  if (source === 'demo' || source === 'test') return source
  return 'live'
}

/**
 * Raw root/scoped Kitchen collection adapter.
 *
 * Console and exact-target development reads use this Firestore adapter.
 */
export function useDevKitchenCollection(
  options: UseDevKitchenCollectionOptions = {}
) {
  const db = useFirestore()
  const { surface } = useKitchenInterface()
  const { appId } = useFireUXConfig()
  const liveRead = useFirestoreRead()
  const sourceRef = computed<KitchenFetchSource>(() =>
    normalizeSource(isRef(options.source) ? options.source.value : options.source)
  )
  const resolvedAppId = computed(() => normalize(appId))
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
      [
        ...(ids ?? []),
        ...(resolvedFilter.value?.ids ?? []),
      ].map((id) => normalize(id)).filter(Boolean)
    )
  })
  const hasIdFilter = computed(() => {
    const ids = isRef(options.ids) ? options.ids.value : options.ids
    return Array.isArray(ids) || Array.isArray(resolvedFilter.value?.ids)
  })
  const idList = computed(() => Array.from(idSet.value))
  const filterOperatorId = computed(() =>
    normalize(resolvedFilter.value?.operatorId ?? resolvedFilter.value?.teamId)
  )
  const hasOperatorFilter = computed(() =>
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'operatorId') ||
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'teamId')
  )
  const rootCollectionPath = computed(() =>
    sourceRef.value === 'live' && !hasIdFilter.value && !hasOperatorFilter.value
      ? KitchenStorage.collection
      : ''
  )
  const testCollectionPath = computed(() =>
    sourceRef.value === 'test' &&
      !hasIdFilter.value &&
      simulationDatabaseId.value
      ? KitchenStorage.collection
      : ''
  )
  const rootSource = liveRead.firestoreFetchCollection<KitchenCollectionDoc>(
    rootCollectionPath
  )
  const appSupportOperatorQuery = computed<Query<KitchenCollectionDoc> | null>(() => {
    if (sourceRef.value !== 'live' || !resolvedAppId.value) return null
    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(db, AppStorage.collection, resolvedAppId.value, AppKitchenStorage.collection),
      where('operator_ids', 'array-contains', filterOperatorId.value)
    ) as Query<KitchenCollectionDoc>
  })
  const appSupportTeamQuery = computed<Query<KitchenCollectionDoc> | null>(() => {
    if (sourceRef.value !== 'live' || !resolvedAppId.value) return null
    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(db, AppStorage.collection, resolvedAppId.value, AppKitchenStorage.collection),
      where('team_ids', 'array-contains', filterOperatorId.value)
    ) as Query<KitchenCollectionDoc>
  })
  const appSupportOperatorSource = liveRead.firestoreQuery<KitchenCollectionDoc>(
    appSupportOperatorQuery,
    undefined,
    computed(() =>
      resolvedAppId.value
        ? `${AppStorage.collection}/${resolvedAppId.value}/${AppKitchenStorage.collection}`
        : ''
    )
  )
  const appSupportTeamSource = liveRead.firestoreQuery<KitchenCollectionDoc>(
    appSupportTeamQuery,
    undefined,
    computed(() =>
      resolvedAppId.value
        ? `${AppStorage.collection}/${resolvedAppId.value}/${AppKitchenStorage.collection}`
        : ''
    )
  )
  const appSupportSource = computed<KitchenCollectionDoc[]>(() => {
    const byId = new Map<string, KitchenCollectionDoc>()

    for (const appSupport of [
      ...(appSupportOperatorSource.value ?? []),
      ...(appSupportTeamSource.value ?? []),
    ]) {
      const id = normalize(appSupport?.id)
      if (id) byId.set(id, { ...appSupport, id })
    }

    return [...byId.values()]
  })
  const allowedKitchenIds = computed(() =>
    appSupportSource.value
      .map((kitchen) => normalize(kitchen?.id))
      .filter(Boolean)
  )
  const exactRootSource = liveRead.firestoreLoadDocsByIds<KitchenCollectionDoc>({
    collectionPath: computed(() =>
      sourceRef.value === 'live' && hasIdFilter.value
        ? KitchenStorage.collection
        : ''
    ),
    ids: idList,
  })
  const appSupportRootSource = liveRead.firestoreLoadDocsByIds<KitchenCollectionDoc>({
    collectionPath: computed(() =>
      sourceRef.value === 'live' && hasOperatorFilter.value
        ? KitchenStorage.collection
        : ''
    ),
    ids: allowedKitchenIds,
  })
  const testSource = simulationRead.firestoreFetchCollection<KitchenCollectionDoc>(
    testCollectionPath
  )
  const exactTestSource = simulationRead.firestoreLoadDocsByIds<KitchenCollectionDoc>({
    collectionPath: computed(() =>
      sourceRef.value === 'test' &&
        hasIdFilter.value &&
        simulationDatabaseId.value
        ? KitchenStorage.collection
        : ''
    ),
    ids: idList,
  })
  const rootDocs = computed<KitchenCollectionDoc[]>(() =>
    sourceRef.value === 'demo'
      ? []
      : sourceRef.value === 'test'
        ? hasIdFilter.value
          ? exactTestSource.docs.value ?? []
          : testSource.value ?? []
        : hasOperatorFilter.value
          ? mergeRootAndAppSupport(
              appSupportRootSource.docs.value ?? [],
              appSupportSource.value
            )
        : hasIdFilter.value
          ? exactRootSource.docs.value ?? []
          : rootSource.value ?? []
  )
  const testPlaceIds = computed(() =>
    sourceRef.value === 'test'
      ? rootDocs.value
        .map(kitchen => normalize(kitchen.id))
        .filter(Boolean)
      : []
  )
  const exactTestPlaceSource = simulationRead.firestoreLoadDocsByIds<Place>({
    collectionPath: computed(() =>
      sourceRef.value === 'test' && simulationDatabaseId.value
        ? PlaceStorage.collection
        : ''
    ),
    ids: testPlaceIds,
  })
  const testPlacesById = computed(() =>
    new Map(
      (exactTestPlaceSource.docs.value ?? [])
        .map(place => [normalize(place.id), place] as const)
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
    const invalid = rootDocs.value.find(kitchen => {
      const placeId = normalize(kitchen.id)
      return !placeId || !testPlacesById.value.has(placeId)
    })
    return invalid
      ? new Error(
          `Test Kitchen ${normalize(invalid.id) || '(unknown)'} is missing its canonical Place.`
        )
      : undefined
  })
  const kitchens = computed<KitchenCollectionDoc[]>(() =>
    rootDocs.value
      .map((kitchen) => {
        const id = normalize(kitchen?.id)
        if (!id) return null
        if (hasIdFilter.value && !idSet.value.has(id)) return null
        if (hasOperatorFilter.value) {
          if (!filterOperatorId.value) return null
          if (!targetHasConsoleAccess(kitchen, filterOperatorId.value)) return null
        }
        const testPlace = sourceRef.value === 'test'
          ? testPlacesById.value.get(normalize(kitchen.id)) ?? null
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
  const active = computed(() =>
    sourceRef.value !== 'demo' &&
      (sourceRef.value !== 'test' || Boolean(simulationDatabaseId.value))
  )
  const pending = computed(() => {
    if (sourceRef.value === 'demo') return false
    if (sourceRef.value === 'test' && !simulationDatabaseId.value) return false
    if (sourceRef.value === 'live' && hasOperatorFilter.value) {
      if (!filterOperatorId.value) return false

      return (
        appSupportRootSource.pending.value ||
        appSupportOperatorSource.pending.value ||
        appSupportTeamSource.pending.value
      )
    }

    const rootPending = hasIdFilter.value
      ? sourceRef.value === 'test'
        ? exactTestSource.pending.value
        : exactRootSource.pending.value
      : sourceRef.value === 'test'
        ? testSource.pending.value
        : rootSource.pending.value
    return rootPending ||
      (sourceRef.value === 'test' && exactTestPlaceSource.pending.value)
  })
  const error = computed<unknown | undefined>(() => {
    if (sourceRef.value === 'demo') return undefined
    if (sourceRef.value === 'test' && !simulationDatabaseId.value) {
      return undefined
    }
    if (sourceRef.value === 'live' && hasOperatorFilter.value) {
      if (!filterOperatorId.value) return undefined

      return appSupportOperatorSource.error.value ??
        appSupportTeamSource.error.value ??
        appSupportRootSource.error.value
    }
    if (hasIdFilter.value) {
      return sourceRef.value === 'test'
        ? exactTestSource.error.value ??
          exactTestPlaceSource.error.value ??
          testPairError.value
        : exactRootSource.error.value
    }
    return sourceRef.value === 'test'
      ? testSource.error.value ??
        exactTestPlaceSource.error.value ??
        testPairError.value
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

function mergeRootAndAppSupport(
  rootDocs: KitchenCollectionDoc[],
  appSupportDocs: KitchenCollectionDoc[]
) {
  const rootById = new Map<string, KitchenCollectionDoc>()
  const appSupportById = new Map<string, KitchenCollectionDoc>()
  const seen = new Set<string>()
  const merged: KitchenCollectionDoc[] = []

  for (const root of rootDocs) {
    const id = normalize(root?.id)
    if (id) rootById.set(id, { ...root, id })
  }

  for (const appSupport of appSupportDocs) {
    const id = normalize(appSupport?.id)
    if (id) appSupportById.set(id, { ...appSupport, id })
  }

  for (const id of [...rootById.keys(), ...appSupportById.keys()]) {
    if (seen.has(id)) continue
    seen.add(id)

    const item = composeKitchenScopedSurface(
      rootById.get(id),
      appSupportById.get(id)
    )
    if (item) merged.push({ ...item, id } as KitchenCollectionDoc)
  }

  return merged
}
