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
    liveBlanks,
    selectedBlank,
    selectedMode,
    blankId,
    rootCollection,
    canWrite,
    selectBlank,
    clearSelectedBlank,
  } = blank
  const selection = computed(() => ({
    blank: selectedBlank.value,
    mode: selectedMode.value,
    blankId: blankId.value,
  }))
  const sections = computed(() => ({
    live: {
      show: true,
      collection: liveBlanks.value,
      pending: blank.pending.value,
    },
  }))
  const runtime = computed(() => ({
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
  }))
  const actions = {
    selectLive: (id: string) => {
      selectBlank(String(id ?? '').trim(), 'live')
    },
    clear: clearSelectedBlank,
  }
  const debug = computed(() => ({
    family: 'blank',
    blankId: blankId.value,
    selectedMode: selectedMode.value,
    pending: blank.pending.value,
    liveCount: liveBlanks.value.length,
    hasLiveBlanks: blank.hasLiveBlanks.value,
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
