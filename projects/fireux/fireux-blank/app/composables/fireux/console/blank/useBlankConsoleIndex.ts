import { computed, ref } from 'vue'
import { useBlankConsole } from './useBlankConsole'

/**
 * Blank console main index seam.
 *
 * Mirrors the real console families while staying intentionally thin:
 * root target cards, create route, and dev debug only.
 */
export function useBlankConsoleIndex() {
  const blank = useBlankConsole()
  const selectedId = ref('')
  const debug = computed(() => ({
    family: 'blank',
    selectedId: selectedId.value,
    pending: blank.pending.value,
    liveCount: blank.liveTargets.value.length,
    hasLiveTargets: blank.hasLiveTargets.value,
    rootCollectionPath: blank.rootCollectionPath,
    appCollectionPath: blank.appCollectionPath.value,
  }))
  const actions = {
    selectLive: (id: string) => {
      selectedId.value = String(id ?? '').trim()
    },
  }

  return {
    blank,
    actions,
    debug,
  }
}
