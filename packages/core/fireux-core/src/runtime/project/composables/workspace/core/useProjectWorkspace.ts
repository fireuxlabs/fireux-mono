import { computed, watch, watchEffect } from 'vue'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { useWorkspacePageState } from '../../../../composables/fireux/workspace/useWorkspacePageState'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { normalizeString } from '../../../../utils/string'
import { useProjectCollection } from '../../useProjectCollection'
import type { ProjectSurface } from '../../useProjectInterface'
import type { ProjectWorkspace } from './project-workspace.types'

export type { ProjectWorkspace } from './project-workspace.types'

function createProjectWorkspace(): ProjectWorkspace {
  const workspace = useWorkspace('project')
  const pageState = useWorkspacePageState('project')
  const { isAuthenticated } = useAuth()
  const fireux = useFireUXConfig()
  const collection = useProjectCollection()
  const project = computed<ProjectSurface | null>(
    () =>
      collection.projects.value.find(
        (item) => normalizeString(item.id) === workspace.activeId.value
      ) ?? null
  )

  watch(
    project,
    (selectedProject) =>
      workspace.setActiveStatus(selectedProject?.status || ''),
    { immediate: true }
  )
  watchEffect(() => {
    const selectedProject = project.value
    pageState.publish({
      user: { signedIn: isAuthenticated.value },
      entity: selectedProject
        ? {
            id: selectedProject.id,
            status: selectedProject.status,
            name: selectedProject.name,
            description: selectedProject.description,
            image_url: selectedProject.image_url,
          }
        : null,
      derived: {
        hasSelection: Boolean(selectedProject),
        operationalReady: selectedProject?.status === 'active',
        outcome: collection.outcome.value,
        readOnly: true,
        canWrite: false,
      },
    })
  })

  return {
    targets: collection,
    selection: {
      project,
      projectId: workspace.activeId,
      projectSource: computed(() => 'live' as const),
      hasSelection: computed(() => Boolean(project.value)),
    },
    runtime: {
      appId: computed(() => fireux.appId),
      ecosystem: computed(() => fireux.ecosystem),
      source: computed(() => 'live' as const),
      dataType: computed(() => 'live' as const),
      rootCollection: computed(() => 'projects'),
      isDemo: computed(() => false),
      readOnly: computed(() => true),
      canWrite: computed(() => false),
    },
    actions: {
      selectProject: workspace.activate,
      clearSelectedProject: workspace.clearActive,
    },
    state: pageState.state,
  }
}

export function useProjectWorkspace(): ProjectWorkspace {
  return createProjectWorkspace()
}
