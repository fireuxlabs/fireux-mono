import { computed } from 'vue'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { normalizeString } from '../../../../utils/string'
import { useProjectCollection } from '../../useProjectCollection'
import type { ProjectSurface } from '../../useProjectInterface'

function createProjectWorkspace() {
  const workspace = useWorkspace('project')
  const fireux = useFireUXConfig()
  const collection = useProjectCollection()
  const project = computed<ProjectSurface | null>(
    () =>
      collection.projects.value.find(
        (item) => normalizeString(item.id) === workspace.currentId.value
      ) ?? null
  )

  return {
    projects: {
      targets: collection.projects,
      count: collection.count,
      pending: collection.pending,
      error: collection.error,
      outcome: collection.outcome,
    },
    selection: {
      project,
      projectId: workspace.currentId,
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
      selectProject: workspace.setCurrent,
      clearSelectedProject: workspace.clearCurrent,
    },
  }
}

export function useProjectWorkspace() {
  return createProjectWorkspace()
}
