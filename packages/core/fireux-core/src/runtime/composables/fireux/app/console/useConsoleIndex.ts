import { computed, unref, watch, type ComputedRef, type Ref } from 'vue'
import { normalizeConsoleString, useConsole } from './useConsole'
import { useConsoleConfig } from './useConsoleConfig'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type ConsoleIndexDebug = Record<string, unknown>
type ConsoleIndexSourceMode = 'tenant' | 'global' | 'standalone'

type UseConsoleIndexSourceOptions = {
  family: string
  globalTargetIds?: MaybeRef<unknown[] | null | undefined>
}

type UseConsoleIndexOptions<
  TTarget,
  TSelection extends Record<string, unknown>,
  TRuntime extends Record<string, unknown>,
> = {
  targets?: MaybeRef<(TTarget | null | undefined)[] | null | undefined>
  pending?: MaybeRef<boolean | null | undefined>
  showTargets?: MaybeRef<boolean | null | undefined>
  selection?: MaybeRef<TSelection>
  selectedId?: MaybeRef<string | null | undefined>
  autoSelectTargetId?: MaybeRef<string | null | undefined>
  runtime?: MaybeRef<TRuntime>
  selectTarget: (id: string) => void
  clearSelection?: () => void
  debug?: MaybeRef<ConsoleIndexDebug | null | undefined>
}

const uniqueStrings = (values: unknown[]) =>
  Array.from(
    new Set(values.map((value) => normalizeConsoleString(value)).filter(Boolean))
  )

export function useConsoleIndexSource(
  options: UseConsoleIndexSourceOptions
) {
  const console = useConsole(options.family)
  const consoleConfig = useConsoleConfig(options.family)
  const mode = computed<ConsoleIndexSourceMode>(() => console.appContext.mode.value)
  const configTargetIds = computed(() =>
    uniqueStrings(consoleConfig.targetIds())
  )
  const globalTargetIds = computed(() =>
    uniqueStrings(options.globalTargetIds ? unref(options.globalTargetIds) ?? [] : [])
  )
  const targetIds = computed(() =>
    mode.value === 'tenant' ? configTargetIds.value : globalTargetIds.value
  )
  const canCreate = computed(() => consoleConfig.canCreateTarget())
  const isTenant = computed(() => mode.value === 'tenant')
  const isSingleTenantTarget = computed(
    () => isTenant.value && configTargetIds.value.length === 1
  )
  const debug = computed(() => ({
    family: normalizeConsoleString(options.family),
    appMode: mode.value,
    configTargetIds: configTargetIds.value,
    globalTargetIds: globalTargetIds.value,
    targetIds: targetIds.value,
    canCreate: canCreate.value,
    isSingleTenantTarget: isSingleTenantTarget.value,
  }))

  return {
    appContext: console.appContext,
    mode,
    isTenant,
    isGlobal: computed(() => mode.value === 'global'),
    isStandalone: computed(() => mode.value === 'standalone'),
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
        ? normalizeConsoleString(unref(options.selectedId))
        : '',
      targetId: options.autoSelectTargetId
        ? normalizeConsoleString(unref(options.autoSelectTargetId))
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
