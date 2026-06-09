import {
  collection,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { PlaceStorage, type Place } from 'fireux-places/runtime/models/place.model'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import type { KitchenSurface } from '../utils/view/useKitchenInterface'
import { useKitchenInterface } from '../utils/view/useKitchenInterface'

type KitchenListDoc = KitchenSurface
type AppKitchenListDoc = {
  id?: string
  operator_ids?: string[]
  team_ids?: string[]
}

export type KitchenListFilterValue = string | number | null | undefined
export type KitchenListFilter = {
  ids?: KitchenListFilterValue[] | null | undefined
  operatorId?: KitchenListFilterValue
  teamId?: KitchenListFilterValue
}

type UseKitchenListOptions = {
  appId?: string | Ref<string | null | undefined> | null
  filter?: KitchenListFilter | Ref<KitchenListFilter | null | undefined> | null
}

const normalize = (value: unknown) => String(value ?? '').trim()

/**
 * Live Kitchen read-many seam.
 *
 * Public detail routes should fetch a single Kitchen by slug/id with
 * `useKitchenFetch`. Demo/test lists belong in demo/dev seams, not here.
 */
export function useKitchenList(options: UseKitchenListOptions = {}) {
  const { surface } = useKitchenInterface()
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection, firestoreLoadDocsByIds, firestoreQuery } =
    useFirestoreRead()
  const liveRootSource = firestoreFetchCollection<KitchenListDoc>(
    KitchenStorage.rootCollection
  )
  const livePlacesSource = firestoreFetchCollection<Place>(PlaceStorage.collection)
  const resolvedFilter = computed<KitchenListFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const currentAppId = computed(() => {
    if (isRef(options.appId)) return normalize(options.appId.value)
    return normalize(options.appId || appId)
  })
  const scopeCollectionPath = computed(() =>
    currentAppId.value
      ? `${AppStorage.collection}/${currentAppId.value}/${KitchenStorage.scopeCollection}`
      : ''
  )
  const hasIdFilter = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const filterIdSet = computed(
    () =>
      new Set(
        (resolvedFilter.value?.ids ?? [])
          .map((value) => normalize(value))
          .filter(Boolean)
      )
  )
  const filterOperatorId = computed(() =>
    normalize(resolvedFilter.value?.operatorId ?? resolvedFilter.value?.teamId)
  )
  const hasOperatorFilter = computed(() =>
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'operatorId') ||
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'teamId')
  )
  const operatorScopeQuery = computed<Query<AppKitchenListDoc> | null>(() => {
    if (!hasOperatorFilter.value || !filterOperatorId.value || !currentAppId.value) {
      return null
    }

    return fsq(
      collection(db, AppStorage.collection, currentAppId.value, KitchenStorage.scopeCollection),
      where('operator_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppKitchenListDoc>
  })
  const teamScopeQuery = computed<Query<AppKitchenListDoc> | null>(() => {
    if (!hasOperatorFilter.value || !filterOperatorId.value || !currentAppId.value) {
      return null
    }

    return fsq(
      collection(db, AppStorage.collection, currentAppId.value, KitchenStorage.scopeCollection),
      where('team_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppKitchenListDoc>
  })
  const operatorScopeSource = firestoreQuery<AppKitchenListDoc>(
    operatorScopeQuery,
    'kitchen-list-operator-scope',
    scopeCollectionPath
  )
  const teamScopeSource = firestoreQuery<AppKitchenListDoc>(
    teamScopeQuery,
    'kitchen-list-team-scope',
    scopeCollectionPath
  )
  const scopeItems = computed<AppKitchenListDoc[]>(() => {
    const scopesById = new Map<string, AppKitchenListDoc>()

    for (const scope of [
      ...(operatorScopeSource.value ?? []),
      ...(teamScopeSource.value ?? []),
    ]) {
      const id = normalize(scope?.id)
      if (!id) continue

      scopesById.set(id, {
        ...scopesById.get(id),
        ...scope,
        id,
        operator_ids: Array.from(
          new Set([
            ...(scopesById.get(id)?.operator_ids ?? []),
            ...(scope.operator_ids ?? []),
          ])
        ),
        team_ids: Array.from(
          new Set([
            ...(scopesById.get(id)?.team_ids ?? []),
            ...(scope.team_ids ?? []),
          ])
        ),
      })
    }

    return Array.from(scopesById.values())
  })
  const scopesByKitchenId = computed(() => {
    const map = new Map<string, AppKitchenListDoc>()

    for (const scope of scopeItems.value) {
      const id = normalize(scope?.id)
      if (id) map.set(id, scope)
    }

    return map
  })
  const allowedKitchenIds = computed(() =>
    scopeItems.value
      .map((kitchen) => normalize(kitchen?.id))
      .filter(Boolean)
  )
  const liveOperatorDocs = firestoreLoadDocsByIds<KitchenListDoc>({
    collectionPath: KitchenStorage.rootCollection,
    ids: allowedKitchenIds,
  })
  const rootItems = computed<KitchenListDoc[]>(() =>
    hasOperatorFilter.value
      ? (liveOperatorDocs.docs.value ?? [])
      : (liveRootSource.value ?? [])
  )
  const placesById = computed(() => {
    const map = new Map<string, Place>()

    for (const place of livePlacesSource.value ?? []) {
      const placeId = normalize(place?.id)
      if (placeId) map.set(placeId, place)
    }

    return map
  })
  const kitchens = computed<KitchenListDoc[]>(() => {
    const allowedKitchenIdSet = new Set(allowedKitchenIds.value)

    return rootItems.value
      .map((kitchen) => {
        const kitchenId = normalize(kitchen?.id)
        if (!kitchenId) return null
        if (hasIdFilter.value && !filterIdSet.value.has(kitchenId)) return null
        if (hasOperatorFilter.value && !allowedKitchenIdSet.has(kitchenId)) return null

        const placeId = normalize(kitchen?.place_id)
        return surface({
          place: placeId ? placesById.value.get(placeId) ?? null : null,
          kitchen: {
            ...kitchen,
            id: kitchenId,
          },
          scope: scopesByKitchenId.value.get(kitchenId) ?? null,
          routeScope: kitchen.route_scope,
        })
      })
      .filter(Boolean) as KitchenListDoc[]
  })
  const count = computed(() => kitchens.value.length)
  const pending = computed(() => {
    if (
      hasOperatorFilter.value &&
      currentAppId.value &&
      (operatorScopeSource.value === undefined ||
        teamScopeSource.value === undefined)
    ) {
      return true
    }

    return hasOperatorFilter.value
      ? liveOperatorDocs.pending.value
      : liveRootSource.value === undefined
  })

  return {
    kitchens,
    count,
    pending,
  }
}
