// Concurrent edit — 2026-07-20 16:26 CEST — Console Spine pass: carry Project target outcome into overview.
import { computed } from 'vue'
import { normalizeString } from '../../../../../utils/string'
import { useConsoleOverview } from '../../../app/console/useConsoleOverview'
import type { ProjectSurface } from '../../../project/useProjectInterface'
import { useProjectConsole } from '../core/useProjectConsole'

export function useProjectConsoleOverview() {
  const { projects, selection, runtime, actions } = useProjectConsole()

  const overview = useConsoleOverview<ProjectSurface>({
    selectedEntity: selection.project,
    targetItems: projects.targets,
    targetOutcome: projects.outcome,
    getId: (project) => normalizeString(project?.id),
  })
  const debug = computed(() => ({
    projectId: selection.projectId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    focus: overview.focus.value,
    multiple: {
      count: overview.multiple.value.count,
      ids: overview.multiple.value.items.map((item) =>
        normalizeString(item?.id)
      ),
    },
  }))

  return {
    ...overview,
    selectedProject: selection.project,
    projectId: selection.projectId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedProject: actions.clearSelectedProject,
    debug,
  }
}
