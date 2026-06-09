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
import { KitchenStorage } from '../../../../models/kitchen.model'
import { useKitchenCollection } from '../../firestore/kitchen/fetch/useKitchenCollection'
import type { KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../firestore/kitchen/utils/view/useKitchenInterface'

type AppKitchenConsoleListDoc = {
  id?: string
  operator_ids?: string[]
  team_ids?: string[]
}

export type KitchenConsoleListFilterValue = string | number | null | undefined
export type KitchenConsoleListFilter = {
  ids?: KitchenConsoleListFilterValue[] | null | undefined
  operatorId?: KitchenConsoleListFilterValue
  teamId?: KitchenConsoleListFilterValue
}

type UseKitchenConsoleListOptions = {
  appId?: string | Ref<string | null | undefined> | null
  filter?: KitchenConsoleListFilter | Ref<KitchenConsoleListFilter | null | undefined> | null
}

const normalize = (value: unknown) => String(value ?? '').trim()

/**
 * Console Kitchen read-many seam.
 *
 * This composes root Kitchen identity with app-scoped operator records for the
 * selected app. It is intentionally separate from `useKitchenCollection()`,
 * which reads only public root Kitchens.
 */
export function useKitchenConsoleList(options: UseKitchenConsoleListOptions = {}) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { firestoreQuery } = useFirestoreRead()
  const { surface } = useKitchenInterface()
  const resolvedFilter = computed<KitchenConsoleListFilter | undefined>(() => {
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
  const filterOperatorId = computed(() =>
    normalize(resolvedFilter.value?.operatorId ?? resolvedFilter.value?.teamId)
  )
  const hasOperatorFilter = computed(() =>
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'operatorId') ||
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'teamId')
  )
  const explicitIds = computed(() =>
    (resolvedFilter.value?.ids ?? []).map((id) => normalize(id)).filter(Boolean)
  )
  const hasExplicitIds = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const operatorScopeQuery = computed<Query<AppKitchenConsoleListDoc> | null>(() => {
    if (!hasOperatorFilter.value || !filterOperatorId.value || !currentAppId.value) {
      return null
    }

    return fsq(
      collection(db, AppStorage.collection, currentAppId.value, KitchenStorage.scopeCollection),
      where('operator_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppKitchenConsoleListDoc>
  })
  const teamScopeQuery = computed<Query<AppKitchenConsoleListDoc> | null>(() => {
    if (!hasOperatorFilter.value || !filterOperatorId.value || !currentAppId.value) {
      return null
    }

    return fsq(
      collection(db, AppStorage.collection, currentAppId.value, KitchenStorage.scopeCollection),
      where('team_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppKitchenConsoleListDoc>
  })
  const operatorScopeSource = firestoreQuery<AppKitchenConsoleListDoc>(
    operatorScopeQuery,
    'kitchen-console-list-operator-scope',
    scopeCollectionPath
  )
  const teamScopeSource = firestoreQuery<AppKitchenConsoleListDoc>(
    teamScopeQuery,
    'kitchen-console-list-team-scope',
    scopeCollectionPath
  )
  const scopeItems = computed<AppKitchenConsoleListDoc[]>(() => {
    const scopesById = new Map<string, AppKitchenConsoleListDoc>()

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
    const map = new Map<string, AppKitchenConsoleListDoc>()

    for (const scope of scopeItems.value) {
      const id = normalize(scope?.id)
      if (id) map.set(id, scope)
    }

    return map
  })
  const collectionIds = computed<string[] | undefined>(() => {
    if (hasOperatorFilter.value) {
      return scopeItems.value.map((scope) => normalize(scope.id)).filter(Boolean)
    }

    return hasExplicitIds.value ? explicitIds.value : undefined
  })
  const rootCollection = useKitchenCollection({ ids: collectionIds })
  const kitchens = computed<KitchenSurface[]>(() =>
    rootCollection.kitchens.value
      .map((kitchen) =>
        surface({
          kitchen,
          scope: scopesByKitchenId.value.get(normalize(kitchen.id)) ?? null,
          routeScope: kitchen.route_scope,
        })
      )
      .filter((kitchen): kitchen is KitchenSurface => Boolean(kitchen))
  )
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

    return rootCollection.pending.value
  })

  return {
    kitchens,
    count,
    pending,
  }
}
