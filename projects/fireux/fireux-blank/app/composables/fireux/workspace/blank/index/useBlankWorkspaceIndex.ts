// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use Blank outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: identify targets through the shared index contract.
// Concurrent edit — 2026-07-21 22:28 CEST — Workspace family alignment: consume the core-owned membership-aware target outcome.
import { computed } from 'vue'
import { useWorkspaceIndex } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceIndex'
import type { Blank } from '../../../../../models/blank.model'
import { useBlankWorkspace } from '../core/useBlankWorkspace'

/**
 * Blank workspace main index seam.
 *
 * Mirrors the real workspace families while staying intentionally thin:
 * root target cards, create route, and dev debug only.
 */
export function useBlankWorkspaceIndex() {
  const {
    blanks,
    targeting,
    selection: workspaceSelection,
    runtime: workspaceRuntime,
    actions: workspaceActions,
  } = useBlankWorkspace()
  const selection = computed(() => ({
    blank: workspaceSelection.blank.value,
    blankId: workspaceSelection.blankId.value,
  }))
  const runtime = computed(() => ({
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
  }))
  const debug = computed(() => ({
    family: 'blank',
    blankId: workspaceSelection.blankId.value,
    pending: blanks.pending.value,
    targetCount: blanks.count.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    appCollectionPath: workspaceRuntime.appCollectionPath.value,
    readOnly: workspaceRuntime.readOnly.value,
    source: targeting.debug.value,
  }))

  return useWorkspaceIndex({
    selection,
    selectedId: computed(() => workspaceSelection.blankId.value),
    runtime,
    targets: blanks.targets,
    outcome: blanks.outcome,
    getTargetId: (target: Blank) => String(target?.id ?? '').trim(),
    selectTarget: (id: string) => {
      workspaceActions.selectBlank(String(id ?? '').trim())
    },
    clearSelection: workspaceActions.clearSelectedBlank,
    debug,
  })
}
