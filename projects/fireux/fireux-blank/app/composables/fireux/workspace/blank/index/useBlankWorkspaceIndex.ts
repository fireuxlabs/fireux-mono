import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useBlankCollection } from '../../../firestore/blank/useBlank'

export function useBlankWorkspaceIndex() {
  const workspace = useWorkspace('blank')
  const blanks = useBlankCollection()
  return { outcome: blanks.outcome, collection: blanks.blanks, selectedId: workspace.selectedId, select: workspace.select, clear: workspace.clear }
}
