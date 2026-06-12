import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type BlankConsoleTargetInput = {
  selectedId?: string
  blankId?: string
}

export function useBlankConsoleTargets() {
  const selection = useConsoleSelection({ family: 'blank' })

  const setBlankConsoleTarget = (
    selectionPatch: BlankConsoleTargetInput = {}
  ) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.blankId,
    })
  }

  return {
    selectedId: selection.selectedId,
    setBlankConsoleTarget,
    clearBlankConsoleTarget: selection.clearSelection,
  }
}
