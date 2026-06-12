import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type BlankConsoleSelectionInput = {
  selectedId?: string
  blankId?: string
}

export function useBlankConsoleSelection() {
  const selection = useConsoleSelection({ family: 'blank' })

  const setBlankConsoleSelection = (
    selectionPatch: BlankConsoleSelectionInput = {}
  ) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.blankId,
    })
  }

  return {
    selectedId: selection.selectedId,
    setBlankConsoleSelection,
    clearBlankConsoleSelection: selection.clearSelection,
  }
}
