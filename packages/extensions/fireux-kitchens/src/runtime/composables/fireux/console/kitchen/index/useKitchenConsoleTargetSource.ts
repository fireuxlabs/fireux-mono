import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useConsoleConfig } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleConfig'
import { targetHasConsoleAccess } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
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
  | 'configured-targets'
  | 'tenant-app'
  | 'user-kitchens'

const normalize = (value: unknown) => String(value ?? '').trim()

const uniqueStrings = (values: unknown[]) =>
  Array.from(new Set(values.map((value) => normalize(value)).filter(Boolean)))

const kitchenScopeId = (scope: unknown) => {
  const value = normalize(scope)
  const [family, id] = value.split(':')

  return family === 'kitchen' ? normalize(id) : ''
}

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
  const consoleConfig = useConsoleConfig('kitchen')
  const { uid } = useAuth()
  const { coreUser, appUser, pending: userPending } = useUser()
  const userId = computed(() => normalize(uid.value))
  const explicitFilter = computed<KitchenConsoleListFilter>(() => {
    if (!options.filter) return {}
    return isRef(options.filter) ? options.filter.value ?? {} : options.filter
  })
  const myKitchenIds = computed(() =>
    Array.isArray(coreUser.value?.myKitchens)
      ? uniqueStrings(coreUser.value.myKitchens)
      : []
  )
  const scopedKitchenIds = computed(() =>
    Array.isArray(appUser.value?.console_scopes)
      ? uniqueStrings(appUser.value.console_scopes.map(kitchenScopeId))
      : []
  )
  const userKitchenIds = computed(() =>
    uniqueStrings([...scopedKitchenIds.value, ...myKitchenIds.value])
  )
  const configuredTargetIds = computed(() =>
    uniqueStrings(consoleConfig.targetIds())
  )
  const hasConfiguredTargets = computed(
    () => configuredTargetIds.value.length > 0
  )
  const hasExplicitFilter = computed(
    () =>
      Array.isArray(explicitFilter.value.ids) ||
      Boolean(normalize(explicitFilter.value.scopeAppId))
  )
  const sourceName = computed<KitchenConsoleTargetSourceName>(() => {
    if (hasExplicitFilter.value) return 'explicit-filter'
    if (hasConfiguredTargets.value) return 'configured-targets'
    if (fireux.isTenant) return 'tenant-app'
    return 'user-kitchens'
  })
  const listFilter = computed<KitchenConsoleListFilter>(() => {
    if (hasExplicitFilter.value) return explicitFilter.value
    if (hasConfiguredTargets.value) return { ids: configuredTargetIds.value }
    if (fireux.isTenant) return { scopeAppId: fireux.appId }
    return { ids: userKitchenIds.value }
  })
  const list = useKitchenConsoleList({ filter: listFilter })
  const targets = computed<KitchenSurface[]>(() => {
    if (sourceName.value !== 'user-kitchens') return list.kitchens.value

    return list.kitchens.value.filter((kitchen) =>
      targetHasConsoleAccess(kitchen, userId.value)
    )
  })
  const count = computed(() => targets.value.length)
  const readOnly = computed(() => false)
  const canCreate = computed(() => consoleConfig.canCreateTarget())
  const pending = computed(() =>
    sourceName.value === 'user-kitchens'
      ? Boolean(userPending.value || list.pending.value)
      : list.pending.value
  )
  const autoSelectSingle = computed(
    () =>
      (sourceName.value === 'tenant-app' ||
        sourceName.value === 'configured-targets') &&
      count.value === 1
  )
  const label = computed(() => {
    if (sourceName.value === 'configured-targets') return 'Configured Kitchens'
    if (sourceName.value === 'tenant-app') return 'Tenant Kitchen'
    if (sourceName.value === 'explicit-filter') return 'Filtered Kitchens'
    return 'My Kitchens'
  })

  return {
    targets,
    count,
    pending,
    sourceName,
    label,
    readOnly,
    canCreate,
    autoSelectSingle,
    filter: listFilter,
    configuredTargetIds,
    userKitchenIds,
  }
}
