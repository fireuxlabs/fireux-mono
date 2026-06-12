import { computed, type Ref } from 'vue'
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
  const sections = computed(() => ({
    targets: {
      show: true,
      collection: projects.targets.value,
      pending: projects.pending.value,
    },
  }))
  const runtime = computed(() => ({
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
  }))
  const actions = {
    selectTarget: (id: string) => {
      consoleActions.selectProject(String(id ?? '').trim())
    },
    clear: consoleActions.clearSelectedProject,
  }
  const debug = computed(() => ({
    projectId: consoleSelection.projectId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    selectedProject: consoleSelection.project.value,
    targetCount: projects.count.value,
  }))

  return {
    selection,
    sections,
    runtime,
    actions,
    debug,
  }
}
