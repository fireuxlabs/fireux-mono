import { computed, isRef, type Ref } from 'vue'
import { useKitchenCollection } from '../../../firestore/kitchen/fetch/useKitchenCollection'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'

export type KitchenConsoleListFilterValue = string | number | null | undefined
export type KitchenConsoleListFilter = {
  ids?: KitchenConsoleListFilterValue[] | null | undefined
  scopeAppId?: KitchenConsoleListFilterValue
}

type UseKitchenConsoleListOptions = {
  filter?: KitchenConsoleListFilter | Ref<KitchenConsoleListFilter | null | undefined> | null
}

const normalize = (value: unknown) => String(value ?? '').trim()

/**
 * Console Kitchen read-many seam.
 *
 * Reads Kitchen console targets from the canonical Kitchen collection.
 * Console authority filtering will be added back deliberately after the simple
 * target spine is stable across all console families.
 */
export function useKitchenConsoleList(options: UseKitchenConsoleListOptions = {}) {
  const resolvedFilter = computed<KitchenConsoleListFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const forcedScopeAppId = computed(() =>
    normalize(resolvedFilter.value?.scopeAppId)
  )
  const collectionIds = computed(() =>
    Array.isArray(resolvedFilter.value?.ids)
      ? (resolvedFilter.value?.ids ?? [])
          .map((id) => normalize(id))
          .filter(Boolean)
      : undefined
  )
  const rootCollection = useKitchenCollection({ ids: collectionIds })
  const kitchens = computed<KitchenSurface[]>(() =>
    forcedScopeAppId.value
      ? rootCollection.kitchens.value.filter(
          (kitchen) =>
            normalize(kitchen.app_scope_app_id) === forcedScopeAppId.value
        )
      : rootCollection.kitchens.value
  )
  const count = computed(() => kitchens.value.length)

  return {
    kitchens,
    count,
    pending: rootCollection.pending,
  }
}
