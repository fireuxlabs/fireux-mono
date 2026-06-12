import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleOverview'
import { type ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { useProjectConsole } from '../core/useProjectConsole'

export function useProjectConsoleOverview() {
  const {
    targetProjects,
    selectedProject,
    projectId,
    rootCollection,
    canWrite,
    clearSelectedProject,
  } =
    useProjectConsole()

  const overview = useConsoleOverview<ProjectSurface>({
    selectedEntity: selectedProject,
    targetItems: targetProjects,
    getId: (project) => normalizeString(project?.id),
  })
  const debug = computed(() => ({
    projectId: projectId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    focus: overview.focus.value,
    multiple: {
      count: overview.multiple.value.count,
      ids: overview.multiple.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    ...overview,
    selectedProject,
    projectId,
    rootCollection,
    canWrite,
    clearSelectedProject,
    debug,
  }
}
