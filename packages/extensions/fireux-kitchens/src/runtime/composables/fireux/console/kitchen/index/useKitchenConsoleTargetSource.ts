import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useKitchenConsoleList,
  type KitchenConsoleListFilter,
} from './useKitchenConsoleList'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'

type UseKitchenConsoleTargetSourceOptions = {
  filter?:
    | KitchenConsoleListFilter
    | Ref<KitchenConsoleListFilter | null | undefined>
    | null
}

type KitchenConsoleTargetSourceName =
  | 'explicit-filter'
  | 'tenant-app'
  | 'user-kitchens'

const normalize = (value: unknown) => String(value ?? '').trim()

const hasUserId = (values: unknown, userId: string) =>
  Array.isArray(values) &&
  values.some((value) => normalize(value) === userId)

const userCanSeeKitchen = (kitchen: KitchenSurface, userId: string) =>
  hasUserId(kitchen.team_ids, userId) || hasUserId(kitchen.operator_ids, userId)

/**
 * Kitchen console target source policy.
 *
 * This is the only layer that decides which Kitchen targets are available.
 * The console runtime and child operations stay ignorant to tenant/global
 * differences and only receive the selected Kitchen runtime.
 */
export function useKitchenConsoleTargetSource(
  options: UseKitchenConsoleTargetSourceOptions = {}
) {
  const fireux = useFireUXConfig()
  const { uid } = useAuth()
  const userId = computed(() => normalize(uid.value))
  const explicitFilter = computed<KitchenConsoleListFilter>(() => {
    if (!options.filter) return {}
    return isRef(options.filter) ? options.filter.value ?? {} : options.filter
  })
  const hasExplicitFilter = computed(
    () =>
      Array.isArray(explicitFilter.value.ids) ||
      Boolean(normalize(explicitFilter.value.scopeAppId))
  )
  const sourceName = computed<KitchenConsoleTargetSourceName>(() => {
    if (hasExplicitFilter.value) return 'explicit-filter'
    if (fireux.isTenant) return 'tenant-app'
    return 'user-kitchens'
  })
  const listFilter = computed<KitchenConsoleListFilter>(() => {
    if (hasExplicitFilter.value) return explicitFilter.value
    if (fireux.isTenant) return { scopeAppId: fireux.appId }
    return {}
  })
  const list = useKitchenConsoleList({ filter: listFilter })
  const targets = computed<KitchenSurface[]>(() => {
    if (sourceName.value !== 'user-kitchens') return list.kitchens.value

    const id = userId.value
    if (!id) return []

    return list.kitchens.value.filter((kitchen) =>
      userCanSeeKitchen(kitchen, id)
    )
  })
  const count = computed(() => targets.value.length)
  const readOnly = computed(() => false)
  const autoSelectSingle = computed(
    () => sourceName.value === 'tenant-app' && count.value === 1
  )
  const label = computed(() => {
    if (sourceName.value === 'tenant-app') return 'Tenant Kitchen'
    if (sourceName.value === 'explicit-filter') return 'Filtered Kitchens'
    return 'My Kitchens'
  })

  return {
    targets,
    count,
    pending: list.pending,
    sourceName,
    label,
    readOnly,
    autoSelectSingle,
    filter: listFilter,
  }
}
