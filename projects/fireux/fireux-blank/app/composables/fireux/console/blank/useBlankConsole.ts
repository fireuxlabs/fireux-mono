import { computed } from 'vue'
import { useBlankCollection } from '../../firestore/blank/useBlank'

/**
 * Blank console harness.
 *
 * Blank has a root-target create/list seam so the console lifecycle can be
 * tested without demo mode, test mode, operations, or child records.
 */
export function useBlankConsole() {
  const { blanks, pending, rootCollectionPath, appCollectionPath } =
    useBlankCollection()
  const liveTargets = computed(() => blanks.value)
  const hasLiveTargets = computed(() => liveTargets.value.length > 0)

  return {
    liveTargets,
    hasLiveTargets,
    pending,
    rootCollectionPath,
    appCollectionPath,
  }
}
