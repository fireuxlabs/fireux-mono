import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/console/useConsoleOverview'
import { type ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { useProjectConsole } from './useProjectConsole'

export function useProjectConsoleOverview() {
  const {
    liveProjects,
    demoProjects,
    testProject,
    selectedProject,
    selectedMode,
    projectId,
    rootCollection,
    canWrite,
    clearSelectedProject,
  } =
    useProjectConsole()

  const overview = useConsoleOverview<ProjectSurface, ProjectSurface>({
    selectedEntity: selectedProject,
    selectedMode,
    liveItems: liveProjects,
    demoItems: demoProjects,
    testItem: testProject,
    getId: (project) => normalizeString(project?.id),
  })
  const debug = computed(() => ({
    mode: selectedMode.value,
    projectId: projectId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    focus: overview.focus.value,
    group: {
      count: overview.group.value.count,
      ids: overview.group.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    ...overview,
    selectedProject,
    selectedMode,
    projectId,
    rootCollection,
    canWrite,
    clearSelectedProject,
    debug,
  }
}
