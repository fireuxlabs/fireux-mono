import { computed } from 'vue'
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
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useBlankConsole()
  const selection = computed(() => ({
    blank: consoleSelection.blank.value,
    blankId: consoleSelection.blankId.value,
  }))
  const sections = computed(() => ({
    targets: {
      show: true,
      collection: blanks.targets.value,
      pending: blanks.pending.value,
    },
  }))
  const runtime = computed(() => ({
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
  }))
  const actions = {
    selectTarget: (id: string) => {
      consoleActions.selectBlank(String(id ?? '').trim())
    },
    clear: consoleActions.clearSelectedBlank,
  }
  const debug = computed(() => ({
    family: 'blank',
    blankId: consoleSelection.blankId.value,
    pending: blanks.pending.value,
    targetCount: blanks.count.value,
    rootCollection: consoleRuntime.rootCollection.value,
    appCollectionPath: consoleRuntime.appCollectionPath.value,
    readOnly: consoleRuntime.readOnly.value,
  }))

  return {
    selection,
    sections,
    runtime,
    actions,
    debug,
  }
}
