import { computed, ref } from 'vue'

type DashboardProfileView = 'profile' | 'edit'

export function useDashboardProfileView(defaultView: DashboardProfileView = 'edit') {
  const view = ref<DashboardProfileView>(defaultView)
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
