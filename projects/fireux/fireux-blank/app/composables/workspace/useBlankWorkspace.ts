import { computed, watch } from 'vue'
import {
  useWorkspace,
  defineWorkspace,
} from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useBlankCollection } from '../fireux/firestore/blank/useBlank'
import { normalizeString } from 'fireux-core/runtime/utils/normalize-string'

export const useBlankWorkspace = defineWorkspace(() => {
  const selection = useWorkspace('blank')
  const blanks = useBlankCollection()
  watch(
    [blanks.blanks, blanks.outcome, selection.selectedId],
    () =>
      selection.reconcile(
        blanks.blanks.value.map((blank) => blank.id),
        blanks.outcome.value
      ),
    { immediate: true }
  )

  const id = selection.selectedId
  const data = computed(() =>
    blanks.outcome.value === 'ready'
      ? (blanks.blanks.value.find(
          (item) => normalizeString(item.id) === id.value
        ) ?? null)
      : null
  )
  const outcome = computed(() => {
    if (!id.value) return 'idle' as const
    if (blanks.outcome.value === 'pending' || blanks.outcome.value === 'error')
      return blanks.outcome.value
    return data.value ? ('ready' as const) : ('empty' as const)
  })

  return {
    data,
    id,
    outcome,
    collectionOutcome: blanks.outcome,
    collection: blanks.blanks,
    select: selection.select,
  }
})
