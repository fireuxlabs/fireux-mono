// Bounded migration seam for older collection-style Workspace indexes.
import { computed, unref, watch, type ComputedRef, type Ref } from 'vue'
import { normalizeString } from '../../../utils/string'

type ValueRef<T> = T | Ref<T> | ComputedRef<T>

type WorkspaceIndexDebug = Record<string, unknown>

export type WorkspaceTargetOutcome =
  | 'idle'
  | 'pending'
  | 'error'
  | 'empty'
  | 'ready'

export function resolveWorkspaceDirectorySelectionOutcome(input: {
  selectedId?: unknown
  selectedTarget?: unknown
  targetOutcome: WorkspaceTargetOutcome
}): WorkspaceTargetOutcome {
  if (!normalizeString(input.selectedId)) return input.targetOutcome
  if (input.selectedTarget) return 'ready'
  return input.targetOutcome === 'error' ? 'error' : 'pending'
}

type UseWorkspaceDirectoryIndexOptions<
  TTarget,
  TSelection extends Record<string, unknown>,
  TRuntime extends Record<string, unknown>,
> = {
  targets?: ValueRef<(TTarget | null | undefined)[] | null | undefined>
  outcome: ValueRef<WorkspaceTargetOutcome>
  showTargets?: ValueRef<boolean | null | undefined>
  selection?: ValueRef<TSelection>
  selectedId?: ValueRef<string | null | undefined>
  selectedTarget?: ValueRef<TTarget | null | undefined>
  autoSelectTargetId?: ValueRef<string | null | undefined>
  getTargetId: (target: TTarget) => string
  runtime?: ValueRef<TRuntime>
  selectTarget: (id: string, source?: string) => void
  clearSelection?: () => void
  debug?: ValueRef<WorkspaceIndexDebug | null | undefined>
}

export function useWorkspaceDirectoryIndex<
  TTarget,
  TSelection extends Record<string, unknown> = Record<string, unknown>,
  TRuntime extends Record<string, unknown> = Record<string, unknown>,
>(options: UseWorkspaceDirectoryIndexOptions<TTarget, TSelection, TRuntime>) {
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
  const showTargets = computed(() =>
    options.showTargets ? Boolean(unref(options.showTargets)) : true
  )
  const selectedOutcome = computed(() =>
    resolveWorkspaceDirectorySelectionOutcome({
      selectedId: options.selectedId ? unref(options.selectedId) : '',
      selectedTarget: options.selectedTarget
        ? unref(options.selectedTarget)
        : null,
      targetOutcome: targetOutcome.value,
    })
  )
  const resolvedSelection = computed(() => ({
    ...selection.value,
    outcome: selectedOutcome.value,
  }))
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
      show: showTargets.value,
      collection: targetItems.value,
      outcome: targetOutcome.value,
    },
  }))
  const counts = computed(() => ({
    targets: targetItems.value.length,
  }))
  const debug = computed(() => ({
    ...(options.debug ? (unref(options.debug) ?? {}) : {}),
    selectedOutcome: selectedOutcome.value,
    workspaceIndex: {
      selection: resolvedSelection.value,
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
    selectTarget: (id: string, source?: string) => {
      options.selectTarget(id, source)
    },
    clear: () => {
      options.clearSelection?.()
    },
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
    selection: resolvedSelection,
    sections,
    runtime,
    counts,
    debug,
    actions,
  }
}
