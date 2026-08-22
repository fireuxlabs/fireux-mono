// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: require one authoritative target outcome.
// Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine pass: gate target auto-selection on authoritative ready state.
import { computed, unref, watch, type ComputedRef, type Ref } from 'vue'
import { normalizeString } from '../../../utils/string'

type ValueRef<T> = Ref<T> | ComputedRef<T>

type WorkspaceIndexDebug = Record<string, unknown>

export type WorkspaceTargetOutcome =
  | 'idle'
  | 'pending'
  | 'error'
  | 'empty'
  | 'ready'

export function resolveWorkspaceSelectedTargetOutcome(input: {
  selectedId?: unknown
  selectedTarget?: unknown
  targetOutcome: WorkspaceTargetOutcome
}): WorkspaceTargetOutcome {
  if (!normalizeString(input.selectedId)) return input.targetOutcome
  if (input.selectedTarget) return 'ready'
  return input.targetOutcome === 'error' ? 'error' : 'pending'
}

type UseWorkspaceIndexOptions<
  TTarget,
  TSelection extends Record<string, unknown>,
  TRuntime extends Record<string, unknown>,
> = {
  targets?: ValueRef<(TTarget | null | undefined)[] | null | undefined>
  outcome: ValueRef<WorkspaceTargetOutcome>
  showTargets?: ValueRef<boolean | null | undefined>
  selection?: ValueRef<TSelection>
  selectedId?: ValueRef<string | null | undefined>
  autoSelectTargetId?: ValueRef<string | null | undefined>
  getTargetId: (target: TTarget) => string
  runtime?: ValueRef<TRuntime>
  selectTarget: (id: string) => void
  clearSelection?: () => void
  debug?: ValueRef<WorkspaceIndexDebug | null | undefined>
}

export function useWorkspaceIndex<
  TTarget,
  TSelection extends Record<string, unknown> = Record<string, unknown>,
  TRuntime extends Record<string, unknown> = Record<string, unknown>,
>(options: UseWorkspaceIndexOptions<TTarget, TSelection, TRuntime>) {
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
  const targetOutcome = computed<WorkspaceTargetOutcome>(() =>
    unref(options.outcome)
  )
  const targetIds = computed(
    () =>
      new Set(
        targetItems.value
          .map((target) => normalizeString(options.getTargetId(target)))
          .filter(Boolean)
      )
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
    ...(options.debug ? (unref(options.debug) ?? {}) : {}),
    workspaceIndex: {
      selection: selection.value,
      runtime: runtime.value,
      targets: {
        show: sections.value.targets.show,
        outcome: targetOutcome.value,
        count: counts.value.targets,
      },
    },
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
      outcome: targetOutcome.value,
      targetIds: targetIds.value,
    }),
    (state: {
      currentId: string
      targetId: string
      outcome: WorkspaceTargetOutcome
      targetIds: Set<string>
    }) => {
      const { currentId, targetId, outcome, targetIds } = state
      if (outcome !== 'ready' || !targetIds.has(targetId)) return
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
