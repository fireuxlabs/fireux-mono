import { computed, ref } from 'vue'

type ConsoleProfileView = 'profile' | 'edit'

export function useConsoleProfileView(defaultView: ConsoleProfileView = 'edit') {
  const view = ref<ConsoleProfileView>(defaultView)
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
