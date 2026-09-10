import { computed } from 'vue'
import { useRoute, useState } from '#imports'

export function useDevUi() {
  const route = useRoute()
  const panelOpen = useState('fireux_dev_panel_open', () => false)
  const notesVisible = useState('fireux_dev_notes_visible', () => true)
  const supportsInlineNotes = computed(() =>
    [
      '/kitchens',
      '/kitchens/create',
      '/workspace/kitchen/create',
      '/portfolios',
      '/portfolios/create',
      '/workspace/portfolio',
      '/workspace/portfolio/create',
      '/suppliers',
      '/suppliers/create',
      '/workspace/supplier',
      '/workspace/supplier/create',
      '/',
    ].includes(route.path)
  )

  const togglePanel = () => {
    panelOpen.value = !panelOpen.value
  }

  const toggleNotes = () => {
    notesVisible.value = !notesVisible.value
  }

  return {
    panelOpen,
    notesVisible,
    supportsInlineNotes,
    togglePanel,
    toggleNotes,
  }
}
