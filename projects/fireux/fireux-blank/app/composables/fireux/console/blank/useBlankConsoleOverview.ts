import { computed } from 'vue'
import { useBlankConsole } from './useBlankConsole'

export function useBlankConsoleOverview() {
  const blank = useBlankConsole()

  return {
    targetCount: computed(() => blank.liveTargets.value.length),
    hasTargets: blank.hasLiveTargets,
    pending: blank.pending,
  }
}
