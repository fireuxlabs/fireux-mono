import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useProjectConsole } from '../core/useProjectConsole'

export function useProjectConsoleIdentity() {
  const {
    selection,
    runtime,
    actions,
  } = useProjectConsole()

  const name = computed(() => normalizeString(selection.project.value?.name))
  const description = computed(() =>
    normalizeString(selection.project.value?.description)
  )
  const imageUrl = computed(() => normalizeString(selection.project.value?.image_url))
  const debug = computed(() => ({
    projectId: selection.projectId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    name: name.value,
    description: description.value,
    imageUrl: imageUrl.value,
    selectedProject: selection.project.value,
  }))

  return {
    selectedProject: selection.project,
    projectId: selection.projectId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedProject: actions.clearSelectedProject,
    name,
    description,
    imageUrl,
    debug,
  }
}

export type ProjectConsoleIdentityState = ReturnType<
  typeof useProjectConsoleIdentity
>
