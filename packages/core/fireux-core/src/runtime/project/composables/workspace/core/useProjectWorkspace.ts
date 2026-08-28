import { computed, watch, watchEffect, type ComputedRef } from 'vue'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { useWorkspacePageState } from '../../../../composables/fireux/workspace/useWorkspacePageState'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { normalizeString } from '../../../../utils/string'
import {
  useProjectCollection,
  type UseProjectCollectionReturn,
} from '../../useProjectCollection'
import type { ProjectSurface } from '../../useProjectInterface'

export type ProjectWorkspace = {
  projects: {
    targets: UseProjectCollectionReturn['projects']
    count: UseProjectCollectionReturn['count']
    pending: UseProjectCollectionReturn['pending']
    error: UseProjectCollectionReturn['error']
    outcome: UseProjectCollectionReturn['outcome']
    refresh: UseProjectCollectionReturn['refresh']
  }
  selection: {
    project: ComputedRef<ProjectSurface | null>
    projectId: ComputedRef<string>
    hasSelection: ComputedRef<boolean>
  }
  runtime: {
    appId: ComputedRef<string>
    ecosystem: ComputedRef<string>
    rootCollection: ComputedRef<string>
    dataType: ComputedRef<'live'>
    isDemo: ComputedRef<boolean>
    readOnly: ComputedRef<boolean>
    canWrite: ComputedRef<boolean>
  }
  actions: {
    selectProject: (
      id: string,
      name?: string,
      description?: string,
      image?: string
    ) => void
    clearSelectedProject: () => void
  }
}

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
    projects: {
      targets: collection.projects,
      count: collection.count,
      pending: collection.pending,
      error: collection.error,
      outcome: collection.outcome,
      refresh: collection.refresh,
    },
    selection: {
      project,
      projectId: workspace.activeId,
      hasSelection: computed(() => Boolean(project.value)),
    },
    runtime: {
      appId: computed(() => fireux.appId),
      ecosystem: computed(() => fireux.ecosystem),
      rootCollection: computed(() => 'projects'),
      dataType: computed(() => 'live' as const),
      isDemo: computed(() => false),
      readOnly: computed(() => true),
      canWrite: computed(() => false),
    },
    actions: {
      selectProject: workspace.activate,
      clearSelectedProject: workspace.clearActive,
    },
  }
}

export function useProjectWorkspace(): ProjectWorkspace {
  return createProjectWorkspace()
}
