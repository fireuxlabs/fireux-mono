import { computed } from 'vue'
import { useBlankCollection } from '../../firestore/blank/useBlank'
import type { ConsoleEntityIndexCard } from 'fireux-core/runtime/components/Console/types'

const text = (value: unknown) => String(value ?? '').trim()

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
  const cards = computed<ConsoleEntityIndexCard[]>(() => {
    const mapped: ConsoleEntityIndexCard[] = []

    for (const target of liveTargets.value) {
      const id = text(target.id)
      if (!id) continue

      mapped.push({
        id,
        title: text(target.name) || id,
        subtitle: target.status,
        meta: id,
        badges: [target.status],
      })
    }

    return mapped
  })

  return {
    liveTargets,
    cards,
    hasLiveTargets,
    pending,
    rootCollectionPath,
    appCollectionPath,
  }
}
