import { computed, isRef } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  resolveConsoleCanWrite,
  resolveConsoleRootCollection,
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useProjectCollection,
  type ProjectCollectionFilter,
} from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectFetch'
import { type ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import type { Ref } from 'vue'

type ProjectConsoleMode = ConsoleMode
type ProjectConsoleEntity = ProjectSurface

type UseProjectConsoleOptions = {
  filter?: ProjectCollectionFilter | Ref<ProjectCollectionFilter | null | undefined> | null
}

export function useProjectConsole(
  options: UseProjectConsoleOptions = {}
) {
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const liveFilter = computed<ProjectCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? options.filter.value ?? {}
      : options.filter ?? {}

    return {
      ...explicitFilter,
      teamId: userId.value,
    }
  })
  const { projects: liveProjects } = useProjectCollection({
    filter: liveFilter,
  })
  const { projects: demoProjects } = useProjectCollection({ source: 'demo' })
  const { project: testProject } = useProjectFetch(userId, { source: 'test' })
  const { selectedEntity, selectedMode, selectEntity, clearSelection } = useConsole<
    ProjectSurface,
    ProjectSurface,
    ProjectSurface
  >('projects', {
    liveItems: liveProjects,
    demoItems: demoProjects,
    testItem: testProject,
    getId: (project) => normalizeString(project?.id),
  })
  const selectedProject = computed<ProjectConsoleEntity | null>(() => selectedEntity.value)
  const projectId = computed(() => normalizeString(selectedProject.value?.id))
  const rootCollection = computed(() =>
    resolveConsoleRootCollection('projects', selectedMode.value)
  )
  const canWrite = computed(() => resolveConsoleCanWrite(selectedMode.value))

  const header = computed<ConsoleHeaderData>(() => {
    const project = selectedProject.value
    if (!project) return null

    if (selectedMode.value === 'demo') {
      return {
        title: normalizeString(project.name),
        subtitle: normalizeString(project.description) || undefined,
        imageUrl: normalizeString(project.image_url) || undefined,
      }
    }

    if (selectedMode.value === 'test') {
      return {
        title: 'Test Project',
        subtitle: normalizeString(project.description) || undefined,
        imageUrl: normalizeString(project.image_url) || undefined,
      }
    }

    return {
      title: normalizeString(project.name),
      subtitle: normalizeString('slug' in project ? project.slug : '') || undefined,
      imageUrl: normalizeString(project.image_url) || undefined,
    }
  })

  usePublishConsoleHeader('projects', header)

  const clearSelectedProject = () => {
    clearSelection()
  }

  const selectProject = (projectId: string, mode: ProjectConsoleMode = 'live') => {
    selectEntity(projectId, mode)
  }

  return {
    liveProjects,
    demoProjects,
    testProject,
    selectedProject,
    selectedMode,
    projectId,
    rootCollection,
    canWrite,
    clearSelectedProject,
    selectProject,
  }
}
