// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use Blank outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: identify targets through the shared index contract.
// Concurrent edit — 2026-07-21 22:28 CEST — Workspace family alignment: consume the core-owned membership-aware target outcome.
import { computed } from 'vue'
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
    selection: workspaceSelection,
    runtime: workspaceRuntime,
    actions: workspaceActions,
  } = useBlankWorkspace()
  const debug = computed(() => ({
    family: 'blank',
    blankId: workspaceSelection.blankId.value,
    pending: blanks.pending.value,
    targetCount: blanks.count.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    appCollectionPath: workspaceRuntime.appCollectionPath.value,
    readOnly: workspaceRuntime.readOnly.value,
  }))

  return {
    blank: workspaceSelection.blank,
    blankId: workspaceSelection.blankId,
    blanks: blanks.targets,
    outcome: blanks.outcome,
    selectBlank: workspaceActions.selectBlank,
    clearBlank: workspaceActions.clearSelectedBlank,
    debug,
  }
}
