import { computed, watch } from 'vue'
import type { WorkspaceTargetOutcome } from '../../../../composables/fireux/workspace/workspace-outcome'
import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { useProjectCollection } from '../../useProjectCollection'

export function useProjectWorkspaceIndex() {
  const workspace = useWorkspace('project')
  const source = useProjectCollection()
  const outcome = computed<WorkspaceTargetOutcome>(() =>
    source.outcome.value === 'empty' && source.projectIds.value.length
      ? 'missing'
      : source.outcome.value
  )

  watch(
    [source.projects, outcome, workspace.selectedId],
    () =>
      workspace.reconcile(
        source.projects.value.map((project) => project.id),
        outcome.value
      ),
    { immediate: true }
  )

  // Opening a Workspace is local selection, not an account-primary mutation.
  return {
    collection: source.projects,
    access: source.access,
    outcome,
    selectedId: workspace.selectedId,
    select: workspace.select,
  }
}
