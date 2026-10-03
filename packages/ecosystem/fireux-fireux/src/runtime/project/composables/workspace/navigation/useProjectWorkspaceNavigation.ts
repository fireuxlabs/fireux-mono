import { computed } from 'vue'
import { useProjectWorkspace } from '../useProjectWorkspace'

export function useProjectWorkspaceNavigation() {
  const workspace = useProjectWorkspace()
  const project = computed(() => ({
    id: workspace.id.value,
    name: workspace.data.value?.name || '',
    tagline: workspace.data.value?.description || '',
    url: workspace.data.value?.image_url || '',
  }))

  return { project, workspace }
}
