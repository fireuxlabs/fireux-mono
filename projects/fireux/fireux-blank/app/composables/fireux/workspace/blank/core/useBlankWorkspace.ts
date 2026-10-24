import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useBlankWorkspaceIndex } from '../index/useBlankWorkspaceIndex'

export function useBlankWorkspace() {
  const index = useBlankWorkspaceIndex()
  const data = computed(
    () =>
      index.collection.value.find(
        (item) => normalizeString(item.id) === index.selectedId.value
      ) ?? null
  )
  const outcome = computed(() => {
    if (!index.selectedId.value) return 'idle' as const
    if (index.outcome.value === 'pending' || index.outcome.value === 'error')
      return index.outcome.value
    return data.value ? ('ready' as const) : ('missing' as const)
  })
  return { data, id: index.selectedId, outcome }
}
