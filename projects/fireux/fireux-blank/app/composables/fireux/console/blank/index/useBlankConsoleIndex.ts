import { computed } from 'vue'
import { useBlankConsole } from '../core/useBlankConsole'

/**
 * Blank console main index seam.
 *
 * Mirrors the real console families while staying intentionally thin:
 * root target cards, create route, and dev debug only.
 */
export function useBlankConsoleIndex() {
  const blank = useBlankConsole()
  const {
    targetBlanks,
    selectedBlank,
    blankId,
    rootCollection,
    canWrite,
    selectBlank,
    clearSelectedBlank,
  } = blank
  const selection = computed(() => ({
    blank: selectedBlank.value,
    blankId: blankId.value,
  }))
  const sections = computed(() => ({
    targets: {
      show: true,
      collection: targetBlanks.value,
      pending: blank.pending.value,
    },
  }))
  const runtime = computed(() => ({
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
  }))
  const actions = {
    selectTarget: (id: string) => {
      selectBlank(String(id ?? '').trim())
    },
    clear: clearSelectedBlank,
  }
  const debug = computed(() => ({
    family: 'blank',
    blankId: blankId.value,
    pending: blank.pending.value,
    targetCount: targetBlanks.value.length,
    rootCollection: rootCollection.value,
    appCollectionPath: blank.appCollectionPath.value,
  }))

  return {
    selection,
    sections,
    runtime,
    actions,
    debug,
  }
}
