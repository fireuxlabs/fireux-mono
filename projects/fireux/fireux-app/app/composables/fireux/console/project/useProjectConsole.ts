import { computed, isRef } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  resolveConsoleRootCollection,
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
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

/**
 * FireUX stack family: Console-backed root entity.
 * Entity: Project.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 *
 * This file adapts root Project authority sources into the private /console/project selected runtime.
   * Project stored truth lives at projects/{projectId}; operator/team ids on that root record are console authority.
 * Project console can manage related App and Ecosystem surfaces as facades over their own stored truth.
 * It should not redefine generic Project collection reads, app-local project ownership, or related entity identities.
 */
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
      operatorId: userId.value,
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
  >('project', {
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
  const canWrite = computed(() => {
    if (selectedMode.value === 'demo') return false
    if (selectedMode.value === 'test') return Boolean(userId.value && projectId.value === userId.value)
    return targetHasOperator(selectedProject.value, userId.value)
  })

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

  usePublishConsoleHeader('project', header)

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
