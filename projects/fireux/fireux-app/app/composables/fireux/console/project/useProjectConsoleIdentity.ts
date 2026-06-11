import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useProjectConsole } from '../useProjectConsole'

export function useProjectConsoleIdentity() {
  const {
    selectedProject,
    selectedMode,
    projectId,
    rootCollection,
    canWrite,
    clearSelectedProject,
  } = useProjectConsole()

  const name = computed(() => normalizeString(selectedProject.value?.name))
  const description = computed(() =>
    normalizeString(selectedProject.value?.description)
  )
  const imageUrl = computed(() => normalizeString(selectedProject.value?.image_url))
  const debug = computed(() => ({
    mode: selectedMode.value,
    projectId: projectId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    name: name.value,
    description: description.value,
    imageUrl: imageUrl.value,
    selectedProject: selectedProject.value,
  }))

  return {
    selectedProject,
    selectedMode,
    projectId,
    rootCollection,
    canWrite,
    clearSelectedProject,
    name,
    description,
    imageUrl,
    debug,
  }
}

export type ProjectConsoleIdentityState = ReturnType<
  typeof useProjectConsoleIdentity
>
