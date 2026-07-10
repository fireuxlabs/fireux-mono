import { computed, unref, type Ref } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useConsoleTargets } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTargets'
import type { ProjectCollectionFilter } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectConsole } from '../core/useProjectConsole'

type UseProjectConsoleIndexOptions = {
  filter?: ProjectCollectionFilter | Ref<ProjectCollectionFilter | null | undefined> | null
}

export function useProjectConsoleIndex(
  options: UseProjectConsoleIndexOptions = {}
) {
  const consoleTargets = useConsoleTargets({ family: 'project' })
  const targetFilter = computed<ProjectCollectionFilter>(() => {
    const explicit = options.filter ? unref(options.filter) ?? {} : {}

    return consoleTargets.filter(explicit)
  })
  const {
    projects,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useProjectConsole({
    filter: targetFilter,
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
    source: consoleTargets.debug.value,
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.projectId.value),
    autoSelectTargetId: computed(() =>
      consoleTargets.singleTargetId.value
    ),
    runtime,
    targets: projects.targets,
    pending: projects.pending,
    selectTarget: (id: string) => {
      consoleActions.selectProject(String(id ?? '').trim())
    },
    clearSelection: consoleActions.clearSelectedProject,
    debug,
  })
}
