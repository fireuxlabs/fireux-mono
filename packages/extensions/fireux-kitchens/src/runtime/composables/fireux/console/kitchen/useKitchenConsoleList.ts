import {
  collection,
  getDocs,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, ref, watch, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { KitchenStorage } from '../../../../models/kitchen.model'
import { useKitchenCollection } from '../../firestore/kitchen/fetch/useKitchenCollection'
import type { KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../firestore/kitchen/utils/view/useKitchenInterface'

type AppKitchenConsoleListDoc = {
  id?: string
  app_scope_app_id?: string
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
  filter?: KitchenConsoleListFilter | Ref<KitchenConsoleListFilter | null | undefined> | null
}

const normalize = (value: unknown) => String(value ?? '').trim()
const uniq = (values: unknown[]) => Array.from(new Set(values.map(normalize).filter(Boolean)))

/**
 * Console Kitchen read-many seam.
 *
 * This composes root Kitchen identity with app-scoped operator records from
 * registered apps. It is intentionally separate from `useKitchenCollection()`,
 * which reads only public root Kitchens.
 */
export function useKitchenConsoleList(options: UseKitchenConsoleListOptions = {}) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { apps } = useAppCollection()
  const { surface } = useKitchenInterface()
  const scopeItems = ref<AppKitchenConsoleListDoc[]>([])
  const scopePending = ref(false)
  let requestId = 0
  const resolvedFilter = computed<KitchenConsoleListFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
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
  const appIds = computed(() =>
    uniq([
      appId,
      ...(apps.value ?? []).map((app) => app.id),
    ])
  )

  const loadAppScopes = async (ids: string[], operatorId: string) => {
    const scopeById = new Map<string, AppKitchenConsoleListDoc>()

    for (const currentAppId of ids) {
      const scopeCollection = collection(
        db,
        AppStorage.collection,
        currentAppId,
        KitchenStorage.scopeCollection
      )
      const queries = [
        fsq(scopeCollection, where('operator_ids', 'array-contains', operatorId)),
        fsq(scopeCollection, where('team_ids', 'array-contains', operatorId)),
      ] as Query<AppKitchenConsoleListDoc>[]

      for (const query of queries) {
        const snapshot = await getDocs(query)

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data()
          const id = normalize(docSnap.id)
          if (!id) continue

          const previous = scopeById.get(id)
          scopeById.set(id, {
            ...previous,
            ...data,
            id,
            app_scope_app_id: currentAppId,
            operator_ids: uniq([
              ...(previous?.operator_ids ?? []),
              ...(data.operator_ids ?? []),
            ]),
            team_ids: uniq([
              ...(previous?.team_ids ?? []),
              ...(data.team_ids ?? []),
            ]),
          })
        }
      }
    }

    return Array.from(scopeById.values())
  }

  watch(
    () => ({
      appIds: appIds.value,
      hasOperatorFilter: hasOperatorFilter.value,
      operatorId: filterOperatorId.value,
    }),
    async ({ appIds, hasOperatorFilter, operatorId }) => {
      const currentRequestId = ++requestId

      if (!hasOperatorFilter || !operatorId || import.meta.server) {
        scopeItems.value = []
        scopePending.value = false
        return
      }

      scopePending.value = true

      try {
        const scopes = await loadAppScopes(appIds, operatorId)
        if (currentRequestId === requestId) scopeItems.value = scopes
      } catch (error) {
        if (import.meta.dev) {
          console.error('[useKitchenConsoleList] app-scoped kitchen read failed', error)
        }
        if (currentRequestId === requestId) scopeItems.value = []
      } finally {
        if (currentRequestId === requestId) scopePending.value = false
      }
    },
    { immediate: true, deep: true }
  )

  const mergedScopeItems = computed<AppKitchenConsoleListDoc[]>(() => {
    const scopesById = new Map<string, AppKitchenConsoleListDoc>()

    for (const scope of scopeItems.value) {
      const id = normalize(scope?.id)
      const scopeAppId = normalize(scope?.app_scope_app_id)
      if (!id || !scopeAppId) continue

      scopesById.set(id, {
        ...scopesById.get(id),
        ...scope,
        id,
        app_scope_app_id: scopeAppId,
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

    for (const scope of mergedScopeItems.value) {
      const id = normalize(scope?.id)
      if (id) map.set(id, scope)
    }

    return map
  })
  const collectionIds = computed<string[] | undefined>(() => {
    if (hasOperatorFilter.value) {
      return mergedScopeItems.value.map((scope) => normalize(scope.id)).filter(Boolean)
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
    if (hasOperatorFilter.value && scopePending.value) return true

    return rootCollection.pending.value
  })

  return {
    kitchens,
    count,
    pending,
  }
}
