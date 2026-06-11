import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useBlankConsole } from './useBlankConsole'
import { useBlankConsoleTargets } from './useBlankConsoleTargets'
import type { Blank } from '../../../models/blank.model'

/**
 * Blank console main index seam.
 *
 * Mirrors the real console families while staying intentionally thin:
 * root target cards, create route, and dev debug only.
 */
export function useBlankConsoleIndex() {
  const blank = useBlankConsole()
  const {
    selectedId,
    mode,
    setBlankConsoleTarget,
    clearBlankConsoleTarget,
  } = useBlankConsoleTargets()
  const sourceBlanks = computed(() => ({
    live: blank.liveTargets.value,
    demo: blank.demoTargets.value,
    test: null,
  }))
  const consoleIndex = useConsoleIndex<Blank, Blank, Blank>({
    entities: sourceBlanks,
    selectEntity: (id, targetMode = 'live') => {
      setBlankConsoleTarget({
        blankId: String(id ?? '').trim(),
        mode: targetMode,
      })
    },
    getTestId: (target) => String(target.id ?? '').trim(),
    debug: computed(() => ({
      family: 'blank',
      selectedId: selectedId.value,
      mode: mode.value,
      pending: blank.pending.value,
      hasLiveTargets: blank.hasLiveTargets.value,
      rootCollectionPath: blank.rootCollectionPath,
      appCollectionPath: blank.appCollectionPath.value,
    })),
  })
  const debug = consoleIndex.debug
  const clearSelectedBlank = () => {
    clearBlankConsoleTarget()
  }

  return {
    blank,
    selectedId,
    mode,
    actions: consoleIndex.actions,
    debug,
    clearSelectedBlank,
  }
}
