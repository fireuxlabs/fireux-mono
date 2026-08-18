// Concurrent edit — 2026-07-20 16:19 CEST — Console Spine project cleanup: adopt authoritative target outcomes.
import { computed } from 'vue'
import { normalizeString } from '../../../../utils/string'
import { useConsole, type ConsoleSource } from '../../../../composables/fireux/console/useConsole'
import { consoleData } from '../../../../composables/fireux/console/useConsoleData'
import { useConsoleEntityRuntime } from '../../../../composables/fireux/console/useConsoleEntityRuntime'
import { useConsoleFamilyRuntime } from '../../../../composables/fireux/console/useConsoleFamilyRuntime'
import { useConsoleTargets } from '../../../../composables/fireux/console/useConsoleTargets'
import {
  useProjectCollection,
} from '../../useProjectCollection'
import type { ProjectSurface } from '../../useProjectInterface'
import { ProjectStorage } from '../../../models/project.model.ts'
import { useProjectConsoleDemoTargets } from './useProjectConsoleDemoTargets'

type ProjectConsoleEntity = ProjectSurface

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
function createProjectConsole() {
  const consoleRoot = useConsole('project')
  const consoleTargets = useConsoleTargets({ family: 'project' })
  const targetFilter = computed(() => consoleTargets.filter({}))
  const liveCollection = useProjectCollection({
    source: consoleRoot.source,
    filter: targetFilter,
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
  const sourceTargetsOutcome = computed(() =>
    consoleRoot.source.value === 'demo'
      ? demoTargets.outcome.value
      : liveCollection.outcome.value
  )
  const liveTargetsOutcome = consoleTargets.resolveOutcome(sourceTargetsOutcome)
  const targetsOutcome = computed(() =>
    consoleRoot.source.value === 'demo'
      ? sourceTargetsOutcome.value
      : liveTargetsOutcome.value
  )
  const entity = useConsoleEntityRuntime<ProjectSurface>({
    family: 'project',
    storageFamily: ProjectStorage.collection,
    targetData,
    targetOutcome: targetsOutcome,
    getId: (project) => normalizeString(project?.id),
    mode: consoleRoot.source,
    readOnly: true,
    enforcedTargetId: consoleTargets.singleTargetId,
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
    targeting: consoleTargets,
    selection,
    runtime,
    actions,
  }
}

export function useProjectConsole() {
  return useConsoleFamilyRuntime('project', createProjectConsole)
}
