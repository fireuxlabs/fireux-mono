// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: require one authoritative target outcome.
// Concurrent edit — 2026-07-20 16:14 CEST — Console Spine pass: gate target auto-selection on authoritative ready state.
import { computed, unref, type ComputedRef, type Ref } from 'vue'

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
  outcome: ValueRef<ConsoleTargetOutcome>
  showTargets?: ValueRef<boolean | null | undefined>
  selection?: ValueRef<TSelection>
  getTargetId: (target: TTarget) => string
  runtime?: ValueRef<TRuntime>
  selectTarget: (id: string) => void
  clearSelection?: () => void
  debug?: ValueRef<ConsoleIndexDebug | null | undefined>
  includeCountsInDebug?: boolean
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
  const targetOutcome = computed<ConsoleTargetOutcome>(() =>
    unref(options.outcome)
  )
  const sections = computed(() => ({
    targets: {
      show: options.showTargets ? Boolean(unref(options.showTargets)) : true,
      collection: targetItems.value,
      outcome: targetOutcome.value,
    },
  }))
  const counts = computed(() => ({
    targets: targetItems.value.length,
  }))
  const debug = computed(() => ({
    ...(options.debug ? unref(options.debug) ?? {} : {}),
    ...(options.includeCountsInDebug === false ? {} : { counts: counts.value }),
  }))

  const actions = {
    selectTarget: (id: string) => {
      options.selectTarget(id)
    },
    clear: options.clearSelection ?? (() => {}),
  }

  return {
    selection,
    sections,
    runtime,
    counts,
    debug,
    actions,
  }
}
