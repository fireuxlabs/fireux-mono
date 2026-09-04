// Concurrent edit — 2026-07-20 16:26 CEST — Workspace Spine pass: carry Project target outcome into overview.
import { computed } from 'vue'
import { normalizeString } from '../../../../utils/string'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

export function useProjectWorkspaceOverview() {
  const workspace = useProjectWorkspace()

  const focus = computed(() => ({
    entity: workspace.data.value,
    id: normalizeString(workspace.data.value?.id),
    hasSelection: Boolean(workspace.data.value),
    outcome: workspace.outcome.value,
  }))
  const multiple = computed(() => ({
    items: workspace.choices.value,
    count: workspace.choices.value.length,
    hasItems: workspace.choices.value.length > 0,
    outcome: workspace.outcome.value,
  }))

  return {
    focus,
    multiple,
    outcome: workspace.outcome,
    selectedProject: workspace.data,
    projectId: workspace.selectedId,
    clearSelectedProject: () => workspace.select(''),
  }
}
