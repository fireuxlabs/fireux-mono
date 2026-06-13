import { computed, isRef } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
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
import { type ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import type { Ref } from 'vue'

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
  const targetFilter = computed<ProjectCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? options.filter.value ?? {}
      : options.filter ?? {}

    if (Array.isArray(explicitFilter.ids)) return explicitFilter

    return {
      ...explicitFilter,
      operatorId: userId.value,
    }
  })
  const { projects: targetProjects, pending: targetsPending } = useProjectCollection({
    filter: targetFilter,
  })
  const { selectedEntity, selectEntity, clearSelection } =
    useConsole<ProjectSurface>('project', {
    targetItems: targetProjects,
    getId: (project) => normalizeString(project?.id),
  })
  const selectedProject = computed<ProjectConsoleEntity | null>(() => selectedEntity.value)
  const projectId = computed(() => normalizeString(selectedProject.value?.id))
  const rootCollection = computed(() => 'projects')
  const readOnly = computed(() => false)
  const canWrite = computed(() =>
    !readOnly.value && targetHasOperator(selectedProject.value, userId.value)
  )

  const header = computed<ConsoleHeaderData>(() => {
    const project = selectedProject.value
    if (!project) return null

    return {
      title: normalizeString(project.name) || normalizeString(project.id),
      subtitle: normalizeString('slug' in project ? project.slug : '') || undefined,
      imageUrl: normalizeString(project.image_url) || undefined,
    }
  })

  usePublishConsoleHeader('project', header)

  const clearSelectedProject = () => {
    clearSelection()
  }

  const selectProject = (projectId: string) => {
    selectEntity(projectId)
  }
  const projects = {
    targets: targetProjects,
    count: computed(() => targetProjects.value.length),
    pending: targetsPending,
  }
  const selection = {
    project: selectedProject,
    projectId,
    hasSelection: computed(() => Boolean(projectId.value)),
  }
  const runtime = {
    rootCollection,
    readOnly,
    canWrite,
  }
  const actions = {
    selectProject,
    clearSelectedProject,
  }

  return {
    projects,
    selection,
    runtime,
    actions,
  }
}
