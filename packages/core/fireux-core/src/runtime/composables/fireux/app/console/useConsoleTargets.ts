import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { normalizeString, uniqueStrings } from '../../../../utils/string'
import { useConsole, type ConsoleAppMode } from './useConsole'

type ValueRef<T> = Ref<T> | ComputedRef<T>

type UseConsoleTargetsOptions = {
  family: string
  globalTargetIds?: ValueRef<unknown[] | null | undefined>
}

export function useConsoleTargets(options: UseConsoleTargetsOptions) {
  const consoleRoot = useConsole(options.family)
  const mode: ConsoleAppMode = consoleRoot.mode
  const configTargetIds = uniqueStrings(consoleRoot.targetIds())
  const globalTargetIds = computed(() =>
    uniqueStrings(options.globalTargetIds ? unref(options.globalTargetIds) : [])
  )
  const targetIds = computed(() =>
    mode === 'tenant' ? configTargetIds : globalTargetIds.value
  )
  const canCreate = consoleRoot.canCreateTarget()
  const isTenant = mode === 'tenant'
  const isSingleTenantTarget = isTenant && configTargetIds.length === 1
  const debug = computed(() => ({
    family: normalizeString(options.family),
    appMode: mode,
    configTargetIds,
    globalTargetIds: globalTargetIds.value,
    targetIds: targetIds.value,
    canCreate,
    isSingleTenantTarget,
  }))

  return {
    appContext: consoleRoot,
    console: consoleRoot,
    mode,
    isTenant,
    isGlobal: mode === 'global',
    isStandalone: mode === 'standalone',
    configTargetIds,
    globalTargetIds,
    targetIds,
    canCreate,
    isSingleTenantTarget,
    debug,
  }
}
