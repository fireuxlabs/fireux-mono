import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  useConsole,
  type ConsoleSource,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleEntityRuntime } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleEntityRuntime'
import {
  useProjectCollection,
  type ProjectCollectionFilter,
} from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { type ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { ProjectStorage } from 'fireux-core/runtime/models/system/project.model'
import type { Ref } from 'vue'

type ProjectConsoleEntity = ProjectSurface

type UseProjectConsoleOptions = {
  filter?: ProjectCollectionFilter | Ref<ProjectCollectionFilter | null | undefined> | null
}

/**
 * FireUX stack family: Console-backed root entity.
 * Entity: Project.
 *
 * This file adapts FireUX control-plane Project records into the private
 * /console/project selected runtime.
 * Access is gated by the current FireUX App admin role at the route boundary.
 * Project has no separate membership or operator model today.
 * Project console can manage related App and Ecosystem surfaces without redefining their stored identity.
 * It should not redefine generic Project collection reads, introduce scoped
 * Project ownership, or redefine related entity identities.
 */
export function useProjectConsole(
  options: UseProjectConsoleOptions = {}
) {
  const consoleRoot = useConsole('project')
  const {
    projects: targetProjects,
    pending: targetsPending,
    error: targetsError,
    outcome: targetsOutcome,
  } = useProjectCollection({
    source: consoleRoot.source,
    filter: options.filter,
  })
  const entity = useConsoleEntityRuntime<ProjectSurface>({
    family: 'project',
    storageFamily: ProjectStorage.collection,
    targetItems: targetProjects,
    targetPending: targetsPending,
    targetError: targetsError,
    getId: (project) => normalizeString(project?.id),
    mode: consoleRoot.source,
    readOnly: true,
  })
  const selectedProject = computed<ProjectConsoleEntity | null>(
    () => entity.selection.selectedTarget.value
  )
  const projectId = entity.selection.entityId

  const clearSelectedProject = () => {
    entity.actions.clearSelection()
  }

  const selectProject = (
    projectId: string,
    source: ConsoleSource = consoleRoot.source.value
  ) => {
    entity.actions.selectTarget(projectId, source)
  }
  const projects = {
    targets: targetProjects,
    count: computed(() => targetProjects.value.length),
    pending: targetsPending,
    outcome: targetsOutcome,
  }
  const selection = {
    project: selectedProject,
    projectId,
    hasSelection: computed(() => Boolean(projectId.value)),
  }
  const runtime = {
    ...entity.runtime,
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
