import { computed } from 'vue'
import { normalizeString } from '../../../../utils/string'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

export function useProjectWorkspaceIdentity() {
  const workspace = useProjectWorkspace()

  const name = computed(() => normalizeString(workspace.data.value?.name))
  const description = computed(() =>
    normalizeString(workspace.data.value?.description)
  )
  const imageUrl = computed(() =>
    normalizeString(workspace.data.value?.image_url)
  )

  return {
    selectedProject: workspace.data,
    projectId: workspace.id,
    name,
    description,
    imageUrl,
  }
}

export type ProjectWorkspaceIdentityState = ReturnType<
  typeof useProjectWorkspaceIdentity
>
