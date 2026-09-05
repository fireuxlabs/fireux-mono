import { watch } from 'vue'
import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { useProjectCollection } from '../../useProjectCollection'

export function useProjectWorkspaceIndex() {
  const workspace = useWorkspace('project')
  const source = useProjectCollection()

  watch(
    [source.projects, source.outcome, workspace.selectedId],
    () =>
      workspace.reconcile(
        source.projects.value.map((project) => project.id),
        source.outcome.value
      ),
    { immediate: true }
  )

  // Opening a Workspace is local selection, not an account-primary mutation.
  return {
    collection: source.projects,
    outcome: source.outcome,
    selectedId: workspace.selectedId,
    select: workspace.select,
  }
}
