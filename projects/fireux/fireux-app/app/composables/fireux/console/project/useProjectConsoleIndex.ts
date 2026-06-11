import { computed, type Ref } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { ProjectCollectionFilter } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectFetch'
import { type ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { useProjectConsole } from './useProjectConsole'

type UseProjectConsoleIndexOptions = {
  filter?: ProjectCollectionFilter | Ref<ProjectCollectionFilter | null | undefined> | null
}

export function useProjectConsoleIndex(
  options: UseProjectConsoleIndexOptions = {}
) {
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const { project: testProjectSource } = useProjectFetch(userId, {
    source: 'test',
  })
  const {
    liveProjects,
    demoProjects,
    selectProject,
    selectedProject,
    selectedMode,
    projectId,
    rootCollection,
    canWrite,
    clearSelectedProject,
  } = useProjectConsole({
    filter: options.filter,
  })

  const sourceProjects = computed(() => ({
    live: liveProjects.value,
    demo: demoProjects.value,
    test: testProjectSource.value,
  }))

  const consoleIndex = useConsoleIndex<ProjectSurface, ProjectSurface, ProjectSurface>({
    entities: sourceProjects,
    selectEntity: selectProject,
    getTestId: (project) => normalizeString(project.id),
    debug: computed(() => ({
      selectedMode: selectedMode.value,
      projectId: projectId.value,
      rootCollection: rootCollection.value,
      canWrite: canWrite.value,
      selectedProject: selectedProject.value,
    })),
  })
  const debug = consoleIndex.debug

  return {
    projects: consoleIndex.entities,
    actions: consoleIndex.actions,
    selectedProject,
    selectedMode,
    projectId,
    rootCollection,
    canWrite,
    debug,
    clearSelectedProject,
  }
}
