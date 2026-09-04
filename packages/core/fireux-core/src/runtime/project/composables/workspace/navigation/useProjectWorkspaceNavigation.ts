import { computed } from 'vue'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

export function useProjectWorkspaceNavigation() {
  const workspace = useProjectWorkspace()
  const project = computed(() => ({
    id: workspace.selectedId.value,
    name: workspace.data.value?.name || '',
    tagline: workspace.data.value?.description || '',
    url: workspace.data.value?.image_url || '',
  }))

  return { project, workspace }
}
