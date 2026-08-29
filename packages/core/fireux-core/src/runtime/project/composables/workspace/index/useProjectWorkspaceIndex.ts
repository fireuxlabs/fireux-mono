import { computed, watch, watchEffect } from 'vue'
import { useWorkspacePageState } from '../../../../composables/fireux/workspace/useWorkspacePageState'
import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { normalizeString } from '../../../../utils/string'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

export type ProjectWorkspaceIndexState = {
  user: {
    id: string
    anonymous: boolean
    projects: string[]
    primaryProject: string
  }
  project: { id: string; name: string; tagline: string; url: string }
  projects: { id: string; name: string; tagline: string; url: string }[]
}

export type ProjectWorkspaceIndexDerived = {
  outcome: 'idle' | 'pending' | 'error' | 'empty' | 'ready'
  hasSelection: boolean
  canCreate: boolean
  canSelectMultiple: boolean
}

export function useProjectWorkspaceIndex() {
  const workspace = useProjectWorkspace()
  const selectionRequest = useWorkspace('project')
  const pageState = useWorkspacePageState('project')
  const state = computed<ProjectWorkspaceIndexState>(() => {
    const selectedProject = workspace.selection.project.value
    return {
      user: {
        id: workspace.user.currentUser.value?.uid || '',
        anonymous: Boolean(workspace.user.currentUser.value?.isAnonymous),
        projects: workspace.targets.projectIds.value,
        primaryProject: workspace.targets.primaryProject.value,
      },
      project: {
        id: normalizeString(selectedProject?.id),
        name: normalizeString(selectedProject?.name),
        tagline: normalizeString(selectedProject?.description),
        url: normalizeString(selectedProject?.image_url),
      },
      projects: workspace.targets.projects.value.map((project) => ({
        id: normalizeString(project.id),
        name: normalizeString(project.name),
        tagline: normalizeString(project.description),
        url: normalizeString(project.image_url),
      })),
    }
  })

  const derived = computed<ProjectWorkspaceIndexDerived>(() => ({
    outcome: workspace.targets.outcome.value,
    hasSelection: workspace.selection.hasSelection.value,
    canSelectMultiple: workspace.user.canOwnMultipleWorkspaces.value,
    canCreate:
      (workspace.targets.outcome.value === 'ready' ||
        workspace.targets.outcome.value === 'empty') &&
      workspace.runtime.canCreate.value &&
      (workspace.targets.count.value === 0 ||
        workspace.user.canOwnMultipleWorkspaces.value),
  }))

  watchEffect(() => {
    pageState.publish({
      user: state.value.user,
      project: state.value.project,
      derived: derived.value,
    })
  })

  watch(
    () =>
      [workspace.targets.primaryProject.value, state.value.projects] as const,
    ([primaryProjectId, projects]) => {
      const primaryProject = projects.find(
        (project) => project.id === primaryProjectId
      )
      if (!primaryProject) return
      workspace.actions.selectProject(
        primaryProject.id,
        primaryProject.name,
        primaryProject.tagline,
        primaryProject.url
      )
    },
    { immediate: true }
  )

  watch(selectionRequest.requestedId, async (projectId: string) => {
    if (!projectId) return
    const project = state.value.projects.find((item) => item.id === projectId)
    const user = workspace.user.currentUser.value
    try {
      if (!project || !user) return
      await $fetch('/api/internal/control/projects/primary', {
        method: 'POST',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        body: { projectId },
      })
      await workspace.targets.refresh()
      workspace.actions.selectProject(
        project.id,
        project.name,
        project.tagline,
        project.url
      )
    } finally {
      selectionRequest.clearRequestedActivation()
    }
  })

  return {
    state,
    derived,
    actions: { refresh: workspace.targets.refresh },
  }
}
