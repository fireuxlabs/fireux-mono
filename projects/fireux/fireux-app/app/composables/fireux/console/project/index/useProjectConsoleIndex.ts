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
    targetProjects,
    selectProject,
    selectedProject,
    projectId,
    rootCollection,
    canWrite,
    clearSelectedProject,
  } = useProjectConsole({
    filter: options.filter,
  })
  const selection = computed(() => ({
    project: selectedProject.value,
    projectId: projectId.value,
  }))
  const sections = computed(() => ({
    targets: {
      show: true,
      collection: targetProjects.value,
    },
  }))
  const runtime = computed(() => ({
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
  }))
  const actions = {
    selectTarget: (id: string) => {
      selectProject(String(id ?? '').trim())
    },
    clear: clearSelectedProject,
  }
  const debug = computed(() => ({
    projectId: projectId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    selectedProject: selectedProject.value,
    targetCount: targetProjects.value.length,
  }))

  return {
    selection,
    sections,
    runtime,
    actions,
    debug,
  }
}
