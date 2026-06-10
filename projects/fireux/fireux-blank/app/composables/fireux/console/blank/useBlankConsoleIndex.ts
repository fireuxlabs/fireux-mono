import { computed } from 'vue'
import { useBlankConsole } from './useBlankConsole'

/**
 * Blank console main index seam.
 *
 * Mirrors the real console families while staying intentionally thin:
 * root target cards, create route, and dev debug only.
 */
export function useBlankConsoleIndex() {
  const blank = useBlankConsole()
  const debug = computed(() => ({
    family: 'blank',
    pending: blank.pending.value,
    liveCount: blank.liveTargets.value.length,
    hasLiveTargets: blank.hasLiveTargets.value,
    rootCollectionPath: blank.rootCollectionPath,
    appCollectionPath: blank.appCollectionPath.value,
  }))

  return {
    blank,
    debug,
  }
}
