import { computed, watchEffect } from 'vue'
import { useWorkspacePageState } from '../../../../composables/fireux/workspace/useWorkspacePageState'
import { normalizeString } from '../../../../utils/string'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

export type ProjectWorkspaceIndexState = {
  user: { id: string; anonymous: boolean }
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
  const pageState = useWorkspacePageState('project')
  const state = computed<ProjectWorkspaceIndexState>(() => {
    const selectedProject = workspace.selection.project.value
    return {
      user: {
        id: workspace.user.currentUser.value?.uid || '',
        anonymous: Boolean(workspace.user.currentUser.value?.isAnonymous),
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

  watchEffect(() => {
    if (
      !workspace.selection.projectId.value &&
      workspace.targets.projects.value.length === 1
    ) {
      workspace.actions.selectProject(
        normalizeString(workspace.targets.projects.value[0]?.id)
      )
    }
  })

  return { state, derived }
}
