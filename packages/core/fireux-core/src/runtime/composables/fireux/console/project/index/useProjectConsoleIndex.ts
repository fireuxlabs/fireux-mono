import { computed, type Ref } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type { ProjectCollectionFilter } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectConsole } from '../core/useProjectConsole'

type UseProjectConsoleIndexOptions = {
  filter?: ProjectCollectionFilter | Ref<ProjectCollectionFilter | null | undefined> | null
}

export function useProjectConsoleIndex(
  options: UseProjectConsoleIndexOptions = {}
) {
  const {
    projects,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useProjectConsole({
    filter: options.filter,
  })
  const selection = computed(() => ({
    project: consoleSelection.project.value,
    projectId: consoleSelection.projectId.value,
  }))
  const runtime = computed(() => ({
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
  }))
  const debug = computed(() => ({
    projectId: consoleSelection.projectId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    selectedProject: consoleSelection.project.value,
    targetCount: projects.count.value,
    authority: 'fireux-app-admin',
    source: consoleRuntime.source.value,
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.projectId.value),
    autoSelectTargetId: computed(() =>
      projects.targets.value.length === 1
        ? String(projects.targets.value[0]?.id || '').trim()
        : ''
    ),
    runtime,
    targets: projects.targets,
    pending: projects.pending,
    outcome: projects.outcome,
    selectTarget: (id: string) => {
      consoleActions.selectProject(String(id ?? '').trim())
    },
    clearSelection: consoleActions.clearSelectedProject,
    debug,
  })
}
