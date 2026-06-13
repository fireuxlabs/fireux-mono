import { computed, unref, type Ref } from 'vue'
import {
  useConsoleIndex,
  useConsoleIndexSource,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type { ProjectCollectionFilter } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectConsole } from '../core/useProjectConsole'

type UseProjectConsoleIndexOptions = {
  filter?: ProjectCollectionFilter | Ref<ProjectCollectionFilter | null | undefined> | null
}

export function useProjectConsoleIndex(
  options: UseProjectConsoleIndexOptions = {}
) {
  const source = useConsoleIndexSource({ family: 'project' })
  const targetFilter = computed<ProjectCollectionFilter>(() => {
    const explicit = options.filter ? unref(options.filter) ?? {} : {}

    return source.isTenant
      ? { ...explicit, ids: source.targetIds.value }
      : explicit
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
    source: source.debug.value,
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.projectId.value),
    autoSelectTargetId: computed(() =>
      source.isSingleTenantTarget ? source.targetIds.value[0] ?? '' : ''
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
