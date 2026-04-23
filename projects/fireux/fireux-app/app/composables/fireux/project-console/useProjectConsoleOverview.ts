import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/console/useConsoleOverview'
import { type ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { useProjectConsole } from './useProjectConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleOverview() {
  const { liveProjects, demoProjects, testProject, selectedProject, selectedMode } =
    useProjectConsole()

  return useConsoleOverview<ProjectSurface, ProjectSurface>({
    selectedEntity: selectedProject,
    selectedMode,
    liveItems: liveProjects,
    demoItems: demoProjects,
    testItem: testProject,
    getId: (project) => normalizeString(project?.id),
  })
}
