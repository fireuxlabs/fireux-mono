// Concurrent edit — 2026-07-20 16:19 CEST — Console Spine project cleanup: adopt authoritative target outcomes.
import { computed } from 'vue'
import { normalizeString } from '../../../../../utils/string'
import { useConsole, type ConsoleSource } from '../../../app/console/useConsole'
import { consoleData } from '../../../app/console/useConsoleData'
import { useConsoleEntityRuntime } from '../../../app/console/useConsoleEntityRuntime'
import {
  useProjectCollection,
  type ProjectCollectionFilter,
} from '../../../project/useProjectCollection'
import type { ProjectSurface } from '../../../project/useProjectInterface'
import { ProjectStorage } from '../../../../../models/system/project.model'
import type { Ref } from 'vue'
import { useProjectConsoleDemoTargets } from './useProjectConsoleDemoTargets'

type ProjectConsoleEntity = ProjectSurface

type UseProjectConsoleOptions = {
  filter?:
    | ProjectCollectionFilter
    | Ref<ProjectCollectionFilter | null | undefined>
    | null
}

/**
 * FireUX stack family: Console-backed root entity.
 * Entity: Project.
 *
 * This file adapts FireUX control-plane Project records into the private
 * /console/project selected runtime.
 * Access requires the current FireUX App membership at the route boundary and
 * a same-id AppProject support record linking the current User as an operator
 * or team member.
 * Project console can inspect related App and Ecosystem surfaces without redefining their stored identity.
 * It should not redefine generic Project collection reads, introduce scoped
 * Project ownership, or redefine related entity identities.
 */
export function useProjectConsole(options: UseProjectConsoleOptions = {}) {
  const consoleRoot = useConsole('project')
  const liveCollection = useProjectCollection({
    source: consoleRoot.source,
    filter: options.filter,
  })
  const demoTargets = useProjectConsoleDemoTargets(
    computed(() => consoleRoot.source.value === 'demo')
  )
  const targetProjects = computed(() =>
    consoleRoot.source.value === 'demo'
      ? (demoTargets.data.value?.projects ?? [])
      : liveCollection.projects.value
  )
  const targetData = computed(() => {
    const type =
      consoleRoot.source.value === 'demo'
        ? 'demo'
        : consoleRoot.source.value === 'test'
          ? 'test'
          : 'live'
    return targetProjects.value.map((project) => consoleData(type, project))
  })
  const targetsPending = computed(() =>
    consoleRoot.source.value === 'demo'
      ? demoTargets.pending.value
      : liveCollection.pending.value
  )
  const targetsError = computed(() =>
    consoleRoot.source.value === 'demo'
      ? demoTargets.error.value
      : liveCollection.error.value
  )
  const targetsOutcome = computed(() =>
    consoleRoot.source.value === 'demo'
      ? demoTargets.outcome.value
      : liveCollection.outcome.value
  )
  const entity = useConsoleEntityRuntime<ProjectSurface>({
    family: 'project',
    storageFamily: ProjectStorage.collection,
    targetData,
    targetOutcome: targetsOutcome,
    getId: (project) => normalizeString(project?.id),
    mode: consoleRoot.source,
    readOnly: true,
    enforcedTargetId: computed(() =>
      targetsOutcome.value === 'ready' && targetProjects.value.length === 1
        ? normalizeString(targetProjects.value[0]?.id)
        : ''
    ),
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
    error: targetsError,
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
