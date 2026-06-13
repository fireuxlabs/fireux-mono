import { computed, unref, watch, type ComputedRef, type Ref } from 'vue'
import { normalizeString, uniqueStrings } from '../../../../utils/string'
import { useConsole, useConsoleConfig } from './useConsole'

type ValueRef<T> = Ref<T> | ComputedRef<T>

type ConsoleIndexDebug = Record<string, unknown>
type ConsoleIndexSourceMode = 'tenant' | 'global' | 'standalone'

type UseConsoleIndexSourceOptions = {
  family: string
  globalTargetIds?: ValueRef<unknown[] | null | undefined>
}

type UseConsoleIndexOptions<
  TTarget,
  TSelection extends Record<string, unknown>,
  TRuntime extends Record<string, unknown>,
> = {
  targets?: ValueRef<(TTarget | null | undefined)[] | null | undefined>
  pending?: ValueRef<boolean | null | undefined>
  showTargets?: ValueRef<boolean | null | undefined>
  selection?: ValueRef<TSelection>
  selectedId?: ValueRef<string | null | undefined>
  autoSelectTargetId?: ValueRef<string | null | undefined>
  runtime?: ValueRef<TRuntime>
  selectTarget: (id: string) => void
  clearSelection?: () => void
  debug?: ValueRef<ConsoleIndexDebug | null | undefined>
}

export function useConsoleIndexSource(
  options: UseConsoleIndexSourceOptions
) {
  const console = useConsole(options.family)
  const consoleConfig = useConsoleConfig(options.family)
  const mode: ConsoleIndexSourceMode = console.appContext.mode
  const configTargetIds = uniqueStrings(consoleConfig.targetIds())
  const globalTargetIds = computed(() =>
    uniqueStrings(options.globalTargetIds ? unref(options.globalTargetIds) ?? [] : [])
  )
  const targetIds = computed(() =>
    mode === 'tenant' ? configTargetIds : globalTargetIds.value
  )
  const canCreate = consoleConfig.canCreateTarget()
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
    appContext: console.appContext,
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

export function useConsoleIndex<
  TTarget,
  TSelection extends Record<string, unknown> = Record<string, unknown>,
  TRuntime extends Record<string, unknown> = Record<string, unknown>,
>(
  options: UseConsoleIndexOptions<TTarget, TSelection, TRuntime>
) {
  const targetItems = computed<TTarget[]>(() => {
    const targets = options.targets ? unref(options.targets) : []
    return Array.isArray(targets)
      ? targets.filter((target): target is TTarget => target != null)
      : []
  })
  const selection = computed<TSelection>(
    () => unref(options.selection) ?? ({} as TSelection)
  )
  const runtime = computed<TRuntime>(
    () => unref(options.runtime) ?? ({} as TRuntime)
  )
  const sections = computed(() => ({
    targets: {
      show: options.showTargets ? Boolean(unref(options.showTargets)) : true,
      collection: targetItems.value,
      pending: options.pending ? Boolean(unref(options.pending)) : false,
    },
  }))
  const counts = computed(() => ({
    targets: targetItems.value.length,
  }))
  const debug = computed(() => ({
    ...(options.debug ? unref(options.debug) ?? {} : {}),
    counts: counts.value,
  }))

  const actions = {
    selectTarget: (id: string) => {
      options.selectTarget(id)
    },
    clear: options.clearSelection ?? (() => {}),
  }

  watch(
    () => ({
      currentId: options.selectedId
        ? normalizeString(unref(options.selectedId))
        : '',
      targetId: options.autoSelectTargetId
        ? normalizeString(unref(options.autoSelectTargetId))
        : '',
    }),
    (state: { currentId: string; targetId: string }) => {
      const { currentId, targetId } = state
      if (!targetId || currentId === targetId) return
      options.selectTarget(targetId)
    },
    { immediate: true }
  )

  return {
    selection,
    sections,
    runtime,
    counts,
    debug,
    actions,
  }
}
