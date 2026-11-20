import { useState } from '#imports'

export function useDiagnosticsUi() {
  const panelOpen = useState('fireux_dev_panel_open', () => false)
  const notesVisible = useState('fireux_dev_notes_visible', () => true)

  const togglePanel = () => {
    panelOpen.value = !panelOpen.value
  }

  const toggleNotes = () => {
    notesVisible.value = !notesVisible.value
  }

  return {
    panelOpen,
    notesVisible,
    togglePanel,
    toggleNotes,
  }
}
