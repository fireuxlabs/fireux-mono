import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { useProjectCollection } from '../../useProjectCollection'

export function useProjectWorkspaceIndex() {
  const workspace = useWorkspace('project')
  const source = useProjectCollection()

  // Opening a Workspace is local selection, not an account-primary mutation.
  return {
    collection: source.projects,
    outcome: source.outcome,
    selectedId: workspace.selectedId,
    select: workspace.select,
    clear: workspace.clear,
  }
}
