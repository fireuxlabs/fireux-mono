import { computed } from 'vue'

/**
 * Blank console harness.
 *
 * This intentionally has no entity model, no Firestore reads, no demo mode,
 * no test mode, no operations, and no child records.
 */
export function useBlankConsole() {
  const liveTargets = computed<never[]>(() => [])
  const hasLiveTargets = computed(() => false)
  const pending = computed(() => false)

  return {
    liveTargets,
    hasLiveTargets,
    pending,
  }
}
