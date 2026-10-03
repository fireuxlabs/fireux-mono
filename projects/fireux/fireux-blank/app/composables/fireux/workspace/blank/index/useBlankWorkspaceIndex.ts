import { watch } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useBlankCollection } from '../../../firestore/blank/useBlank'

export function useBlankWorkspaceIndex() {
  const workspace = useWorkspace('blank')
  const blanks = useBlankCollection()
  watch(
    [blanks.blanks, blanks.outcome, workspace.selectedId],
    () => workspace.reconcile(
      blanks.blanks.value.map((blank) => blank.id),
      blanks.outcome.value
    ),
    { immediate: true }
  )
  return {
    outcome: blanks.outcome,
    collection: blanks.blanks,
    selectedId: workspace.selectedId,
    select: workspace.select,
  }
}
