import { computed } from 'vue'
import { useRoute, useState } from '#imports'
import { useFireUXConfig } from '../FireUXConfig'

export function useDevUi() {
  const route = useRoute()
  const { consoleRegistry } = useFireUXConfig()
  const panelOpen = useState('fireux_dev_panel_open', () => false)
  const notesVisible = useState('fireux_dev_notes_visible', () => true)
  const supportsInlineNotes = computed(() => {
    const paths = consoleRegistry
      .filter(registration => registration.supportsInlineNotes === true)
      .flatMap(registration => [
        `/${registration.rootCollection}`,
        `/${registration.rootCollection}/create`,
        `/console/${registration.family}`,
        `/console/${registration.family}/create`,
      ])
    return paths.includes(route.path)
  })

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
