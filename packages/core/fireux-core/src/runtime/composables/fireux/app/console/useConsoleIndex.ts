import { computed, unref, watch, type ComputedRef, type Ref } from 'vue'
import { normalizeString } from '../../../../utils/string'

type ValueRef<T> = Ref<T> | ComputedRef<T>

type ConsoleIndexDebug = Record<string, unknown>

export type ConsoleTargetOutcome =
  | 'idle'
  | 'pending'
  | 'error'
  | 'empty'
  | 'ready'

type UseConsoleIndexOptions<
  TTarget,
  TSelection extends Record<string, unknown>,
  TRuntime extends Record<string, unknown>,
> = {
  targets?: ValueRef<(TTarget | null | undefined)[] | null | undefined>
  pending?: ValueRef<boolean | null | undefined>
  outcome?: ValueRef<ConsoleTargetOutcome | null | undefined>
  showTargets?: ValueRef<boolean | null | undefined>
  selection?: ValueRef<TSelection>
  selectedId?: ValueRef<string | null | undefined>
  autoSelectTargetId?: ValueRef<string | null | undefined>
  runtime?: ValueRef<TRuntime>
  selectTarget: (id: string) => void
  clearSelection?: () => void
  debug?: ValueRef<ConsoleIndexDebug | null | undefined>
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
  const targetsPending = computed(() =>
    options.pending ? Boolean(unref(options.pending)) : false
  )
  const targetOutcome = computed<ConsoleTargetOutcome>(() => {
    const explicitOutcome = options.outcome
      ? unref(options.outcome)
      : undefined

    if (explicitOutcome) return explicitOutcome
    if (targetsPending.value) return 'pending'
    return targetItems.value.length ? 'ready' : 'empty'
  })
  const sections = computed(() => ({
    targets: {
      show: options.showTargets ? Boolean(unref(options.showTargets)) : true,
      collection: targetItems.value,
      pending: targetsPending.value,
      outcome: targetOutcome.value,
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
