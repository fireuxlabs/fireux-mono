// Concurrent edit — 2026-07-20 16:19 CEST — Workspace Spine project cleanup: adopt authoritative target outcomes.
import { computed } from 'vue'
import { normalizeString } from '../../../../utils/string'
import {
  useWorkspace, type WorkspaceSource, } from '../../../../composables/fireux/workspace/useWorkspace'
import { workspaceData } from '../../../../composables/fireux/workspace/useWorkspaceData'
import { useWorkspaceEntityRuntime } from '../../../../composables/fireux/workspace/useWorkspaceEntityRuntime'
import { useWorkspaceFamilyRuntime } from '../../../../composables/fireux/workspace/useWorkspaceFamilyRuntime'
import { useWorkspaceTargets } from '../../../../composables/fireux/workspace/useWorkspaceTargets'
import { useProjectCollection } from '../../useProjectCollection'
import type { ProjectSurface } from '../../useProjectInterface'
import { useProjectWorkspaceDemoTargets } from './useProjectWorkspaceDemoTargets'

type ProjectWorkspaceEntity = ProjectSurface

/**
 * FireUX stack family: Workspace-backed root entity.
 * Entity: Project.
 *
 * This file adapts FireUX control-plane Project records into the
 * /workspace/project selected runtime.
 * Access requires the current FireUX App membership at the route boundary and
 * exact membership in the root Project's Team.
 * Project workspace can inspect related App and Ecosystem surfaces without redefining their stored identity.
 * It should not redefine generic Project collection reads, introduce scoped
 * Project ownership, or redefine related entity identities.
 */
function createProjectWorkspace() {
  const workspaceRoot = useWorkspace('project')
  const workspaceTargets = useWorkspaceTargets({ family: 'project' })
  const targetFilter = computed(() => workspaceTargets.filter({}))
  const liveCollection = useProjectCollection({
    source: workspaceRoot.source,
    filter: targetFilter,
  })
  const demoTargets = useProjectWorkspaceDemoTargets(
    computed(() => workspaceRoot.source.value === 'demo')
  )
  const targetProjects = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? (demoTargets.data.value?.projects ?? [])
      : liveCollection.projects.value
  )
  const targetData = computed(() => {
    const type =
      workspaceRoot.source.value === 'demo'
        ? 'demo'
        : workspaceRoot.source.value === 'test'
          ? 'test'
          : 'live'
    return targetProjects.value.map((project) => workspaceData(type, project))
  })
  const targetsPending = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? demoTargets.pending.value
      : liveCollection.pending.value
  )
  const targetsError = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? demoTargets.error.value
      : liveCollection.error.value
  )
  const sourceTargetsOutcome = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? demoTargets.outcome.value
      : liveCollection.outcome.value
  )
  const liveTargetsOutcome =
    workspaceTargets.resolveOutcome(sourceTargetsOutcome)
  const targetsOutcome = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? sourceTargetsOutcome.value
      : liveTargetsOutcome.value
  )
  const entity = useWorkspaceEntityRuntime<ProjectSurface>({
    family: 'project',
    storageFamily: 'projects',
    targetData,
    targetOutcome: targetsOutcome,
    getId: (project) => normalizeString(project?.id),
    mode: workspaceRoot.source,
    readOnly: true,
    enforcedTargetId: workspaceTargets.singleTargetId,
  })
  const selectedProject = computed<ProjectWorkspaceEntity | null>(
    () => entity.selection.selectedTarget.value
  )
  const projectId = entity.selection.entityId

  const clearSelectedProject = () => {
    entity.actions.clearSelection()
  }

  const selectProject = (
    projectId: string,
    source: WorkspaceSource = workspaceRoot.source.value
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
    targeting: workspaceTargets,
    selection,
    runtime,
    actions,
  }
}

export function useProjectWorkspace() {
  return useWorkspaceFamilyRuntime('project', createProjectWorkspace)
}
