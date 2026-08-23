// Concurrent edit — 2026-07-20 16:26 CEST — Workspace Spine pass: carry Project target outcome into overview.
import { computed } from 'vue'
import { normalizeString } from '../../../../utils/string'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

export function useProjectWorkspaceOverview() {
  const { projects, selection, runtime, actions } = useProjectWorkspace()

  const focus = computed(() => ({
    entity: selection.project.value,
    id: normalizeString(selection.project.value?.id),
    hasSelection: Boolean(selection.project.value),
    outcome: projects.outcome.value,
  }))
  const multiple = computed(() => ({
    items: projects.targets.value,
    count: projects.count.value,
    hasItems: projects.count.value > 0,
    outcome: projects.outcome.value,
  }))
  const debug = computed(() => ({
    projectId: selection.projectId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    focus: focus.value,
    multiple: {
      count: multiple.value.count,
      ids: multiple.value.items.map((item) =>
        normalizeString(item?.id)
      ),
    },
  }))

  return {
    focus,
    multiple,
    outcome: projects.outcome,
    selectedProject: selection.project,
    projectId: selection.projectId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedProject: actions.clearSelectedProject,
    debug,
  }
}
