import { useOverview } from 'fireux-core/runtime/composables/fireux/useOverview'
// Concurrent edit — 2026-07-20 16:26 CEST — Workspace Spine pass: carry Project target outcome into overview.
import { computed } from 'vue'
import { useProjectWorkspace } from './workspace/useProjectWorkspace'
import { useProjectWorkspaceIndex } from './workspace/useProjectWorkspaceIndex'

export function useProjectOverview() {
  const workspace = useProjectWorkspace()
  const index = useProjectWorkspaceIndex()

  const { focus } = useOverview({
    entity: workspace.data,
    id: workspace.id,
    outcome: workspace.outcome,
  })
  const multiple = computed(() => ({
    items: index.collection.value,
    count: index.collection.value.length,
    hasItems: index.collection.value.length > 0,
    outcome: index.outcome.value,
  }))

  return {
    focus,
    multiple,
    outcome: workspace.outcome,
    selectedProject: workspace.data,
    projectId: workspace.id,
  }
}
