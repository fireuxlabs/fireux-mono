import { computed } from 'vue'
import { useBlankConsole } from './useBlankConsole'
import { useBlankConsoleTargets } from './useBlankConsoleTargets'

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
  const debug = computed(() => ({
    family: 'blank',
    selectedId: selectedId.value,
    mode: mode.value,
    pending: blank.pending.value,
    liveCount: blank.liveTargets.value.length,
    hasLiveTargets: blank.hasLiveTargets.value,
    rootCollectionPath: blank.rootCollectionPath,
    appCollectionPath: blank.appCollectionPath.value,
  }))
  const actions = {
    selectLive: (id: string) => {
      setBlankConsoleTarget({ blankId: String(id ?? '').trim(), mode: 'live' })
    },
  }
  const clearSelectedBlank = () => {
    clearBlankConsoleTarget()
  }

  return {
    blank,
    selectedId,
    actions,
    debug,
    clearSelectedBlank,
  }
}
