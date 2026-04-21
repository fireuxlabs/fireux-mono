import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/console/useConsoleOverview'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { type ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { useProjectConsole } from './useProjectConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleOverview() {
  const { projects: liveProjects } = useProjectCollection({ source: 'live', scope: 'mine' })
  const { selectedProject, selectedMode } = useProjectConsole()

  return useConsoleOverview<ProjectSurface, ProjectSurface>({
    selectedEntity: selectedProject,
    selectedMode,
    liveItems: liveProjects,
    getId: (project) => normalizeString(project?.id),
  })
}
