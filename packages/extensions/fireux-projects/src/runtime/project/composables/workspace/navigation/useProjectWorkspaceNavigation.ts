import { computed } from 'vue'
import { useProjectWorkspace } from '../useProjectWorkspace'

export function useProjectWorkspaceNavigation() {
  const workspace = useProjectWorkspace()
  const project = computed(() => ({
    id: workspace.id.value,
    name: workspace.data.value?.identity.name || '',
    tagline: workspace.data.value?.identity.description || '',
    url: workspace.data.value?.identity.image_url || '',
  }))

  return { project, workspace }
}
