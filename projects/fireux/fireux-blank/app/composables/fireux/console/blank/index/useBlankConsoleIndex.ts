import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useBlankConsole } from '../core/useBlankConsole'
import type { Blank } from '../../../../../models/blank.model'

/**
 * Blank console main index seam.
 *
 * Mirrors the real console families while staying intentionally thin:
 * root target cards, create route, and dev debug only.
 */
export function useBlankConsoleIndex() {
  const blank = useBlankConsole()
  const {
    selectedBlank,
    selectedMode,
    blankId,
    rootCollection,
    canWrite,
    selectBlank,
    clearSelectedBlank,
  } = blank
  const sourceBlanks = computed(() => ({
    live: blank.liveBlanks.value,
    demo: blank.demoBlanks.value,
    test: blank.testBlank.value,
  }))
  const consoleIndex = useConsoleIndex<Blank, Blank, Blank>({
    entities: sourceBlanks,
    selectEntity: (id, targetMode = 'live') => {
      selectBlank(String(id ?? '').trim(), targetMode)
    },
    getTestId: (target) => String(target.id ?? '').trim(),
    debug: computed(() => ({
      family: 'blank',
      blankId: blankId.value,
      selectedMode: selectedMode.value,
      pending: blank.pending.value,
      hasLiveBlanks: blank.hasLiveBlanks.value,
      rootCollection: rootCollection.value,
      appCollectionPath: blank.appCollectionPath.value,
    })),
  })
  const debug = consoleIndex.debug

  return {
    blanks: consoleIndex.entities,
    actions: consoleIndex.actions,
    selectedBlank,
    selectedMode,
    blankId,
    rootCollection,
    canWrite,
    debug,
    clearSelectedBlank,
  }
}
