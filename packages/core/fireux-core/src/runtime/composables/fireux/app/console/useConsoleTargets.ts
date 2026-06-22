import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { normalizeString, uniqueStrings } from '../../../../utils/string'
import { useConsole, type ConsoleAppMode } from './useConsole'

type ValueRef<T> = Ref<T> | ComputedRef<T>

type UseConsoleTargetsOptions = {
  family: string
  globalTargetIds?: ValueRef<unknown[] | null | undefined>
}

type ConsoleTargetFilter = Record<string, unknown>

export function useConsoleTargets(options: UseConsoleTargetsOptions) {
  const consoleRoot = useConsole(options.family)
  const mode: ConsoleAppMode = consoleRoot.mode
  const configTargetIds = uniqueStrings(consoleRoot.targetIds())
  const configDevTargetIds = uniqueStrings(consoleRoot.devTargetIds())
  const globalTargetIds = computed(() =>
    uniqueStrings(options.globalTargetIds ? unref(options.globalTargetIds) : [])
  )
  const targetIds = computed(() => {
    if (mode === 'tenant') return configTargetIds

    return uniqueStrings([
      ...globalTargetIds.value,
      ...configDevTargetIds,
    ])
  })
  const canCreate = consoleRoot.canCreateTarget()
  const isTenant = mode === 'tenant'
  const isSingleTenantTarget = isTenant && configTargetIds.length === 1
  const singleTargetId = computed(() =>
    isSingleTenantTarget ? targetIds.value[0] ?? '' : ''
  )
  const filter = <TFilter extends ConsoleTargetFilter>(base: TFilter) =>
    isTenant ? { ...base, ids: targetIds.value } : base
  const debug = computed(() => ({
    family: normalizeString(options.family),
    appMode: mode,
    configTargetIds,
    configDevTargetIds,
    globalTargetIds: globalTargetIds.value,
    targetIds: targetIds.value,
    canCreate,
    isSingleTenantTarget,
  }))

  return {
    console: consoleRoot,
    mode,
    isTenant,
    isGlobal: mode === 'global',
    isStandalone: mode === 'standalone',
    configTargetIds,
    configDevTargetIds,
    globalTargetIds,
    targetIds,
    canCreate,
    isSingleTenantTarget,
    singleTargetId,
    filter,
    debug,
  }
}
