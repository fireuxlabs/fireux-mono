// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use Blank outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:14 CEST — Console Spine project cleanup: identify targets through the shared index contract.
// Concurrent edit — 2026-07-21 22:28 CEST — Console family alignment: consume the core-owned membership-aware target outcome.
import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type { Blank } from '../../../../../models/blank.model'
import { useBlankConsole } from '../core/useBlankConsole'

/**
 * Blank console main index seam.
 *
 * Mirrors the real console families while staying intentionally thin:
 * root target cards, create route, and dev debug only.
 */
export function useBlankConsoleIndex() {
  const {
    blanks,
    targeting,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useBlankConsole()
  const selection = computed(() => ({
    blank: consoleSelection.blank.value,
    blankId: consoleSelection.blankId.value,
  }))
  const runtime = computed(() => ({
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
  }))
  const debug = computed(() => ({
    family: 'blank',
    blankId: consoleSelection.blankId.value,
    pending: blanks.pending.value,
    targetCount: blanks.count.value,
    rootCollection: consoleRuntime.rootCollection.value,
    appCollectionPath: consoleRuntime.appCollectionPath.value,
    readOnly: consoleRuntime.readOnly.value,
    source: targeting.debug.value,
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.blankId.value),
    autoSelectTargetId: computed(() =>
      targeting.singleTargetId.value
    ),
    runtime,
    targets: blanks.targets,
    outcome: blanks.outcome,
    getTargetId: (target: Blank) => String(target?.id ?? '').trim(),
    selectTarget: (id: string) => {
      consoleActions.selectBlank(String(id ?? '').trim())
    },
    clearSelection: consoleActions.clearSelectedBlank,
    debug,
  })
}
