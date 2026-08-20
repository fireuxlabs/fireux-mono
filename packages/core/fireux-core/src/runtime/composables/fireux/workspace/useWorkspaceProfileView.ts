import { computed, ref } from 'vue'

type WorkspaceProfileView = 'profile' | 'edit'

export function useWorkspaceProfileView(defaultView: WorkspaceProfileView = 'edit') {
  const view = ref<WorkspaceProfileView>(defaultView)
  const viewIcon = computed(() =>
    view.value === 'profile' ? 'i-lucide-pencil' : 'i-lucide-eye'
  )

  const toggleView = () => {
    view.value = view.value === 'profile' ? 'edit' : 'profile'
  }

  return {
    view,
    viewIcon,
    toggleView,
  }
}
