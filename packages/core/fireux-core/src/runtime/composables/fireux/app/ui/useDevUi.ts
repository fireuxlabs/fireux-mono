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
      '/console/kitchen',
      '/console/kitchen/create',
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
