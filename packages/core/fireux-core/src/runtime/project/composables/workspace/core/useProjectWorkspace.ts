import { computed, watch, watchEffect } from 'vue'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { useUser } from '../../../../user/composables/useUser'
import { normalizeString } from '../../../../utils/string'
import { resolveWorkspaceCanCreate } from '../../../../utils/workspace-policy'
import { useProjectCollection } from '../../useProjectCollection'
import type { ProjectSurface } from '../../useProjectInterface'
import type { ProjectWorkspace } from './project-workspace.types'

export type { ProjectWorkspace } from './project-workspace.types'

function createProjectWorkspace(): ProjectWorkspace {
  const workspace = useWorkspace('project')
  const { currentUser } = useAuth()
  const { canOwnMultipleWorkspaces } = useUser()
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

  watch(
    [workspace.activeId, project, collection.outcome],
    (values: [string, unknown, string]) => {
      const [id, activeEntity, outcome] = values
      if (!id || activeEntity || (outcome !== 'ready' && outcome !== 'empty'))
        return
      workspace.clearActive()
    },
    { immediate: true }
  )

  const canCreate = computed(() =>
    resolveWorkspaceCanCreate(fireux.role, fireux.workspaceConfig, 'project')
  )

  watchEffect(() => {
    workspace.setChoices(
      canOwnMultipleWorkspaces.value
        ? collection.projects.value.map((item) => ({
            id: normalizeString(item.id),
            name: normalizeString(item.name),
            description: normalizeString(item.description),
            image: normalizeString(item.image_url),
          }))
        : []
    )
  })

  return {
    user: {
      currentUser,
      canOwnMultipleWorkspaces,
    },
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
      canCreate,
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
