import { computed } from 'vue'
import {
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/console/useConsole'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleHeader'
import { getDemoProjects } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
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

const normalizeString = (value: unknown) => String(value ?? '').trim()

function toDemoProjectSurface(
  project: ReturnType<typeof getDemoProjects>[number]
): ProjectSurface {
  const id = normalizeString(project.id)

  return {
    id,
    slug: id,
    name: normalizeString(project.name),
    description: normalizeString(project.label),
    image_url: normalizeString(project.image_url),
    project_type: 'demo',
    status: 'active',
  }
}

type UseProjectConsoleOptions = {
  filter?: ProjectCollectionFilter | Ref<ProjectCollectionFilter | null | undefined> | null
}

export function useProjectConsole(
  options: UseProjectConsoleOptions = {}
) {
  const { uid } = useAuth()
  const { projects: liveProjects } = useProjectCollection({
    filter: options.filter,
  })
  const demoProjects = computed<ProjectSurface[]>(() =>
    getDemoProjects().map(toDemoProjectSurface)
  )
  const { project: testProject } = useProjectFetch(uid, { source: 'test' })
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
    clearSelectedProject,
    selectProject,
  }
}
