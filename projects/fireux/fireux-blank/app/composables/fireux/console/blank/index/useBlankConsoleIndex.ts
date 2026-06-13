import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useConsoleTargets } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTargets'
import { useBlankConsole } from '../core/useBlankConsole'

/**
 * Blank console main index seam.
 *
 * Mirrors the real console families while staying intentionally thin:
 * root target cards, create route, and dev debug only.
 */
export function useBlankConsoleIndex() {
  const source = useConsoleTargets({ family: 'blank' })
  const {
    blanks,
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
    source: source.debug.value,
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.blankId.value),
    autoSelectTargetId: computed(() =>
      source.isSingleTenantTarget ? source.targetIds.value[0] ?? '' : ''
    ),
    runtime,
    targets: blanks.targets,
    pending: blanks.pending,
    selectTarget: (id: string) => {
      consoleActions.selectBlank(String(id ?? '').trim())
    },
    clearSelection: consoleActions.clearSelectedBlank,
    debug,
  })
}
