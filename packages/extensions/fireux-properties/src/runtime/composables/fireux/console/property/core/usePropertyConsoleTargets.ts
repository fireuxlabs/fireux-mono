import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type PropertyConsoleTargetInput = {
  selectedId?: string
  propertyId?: string
}

export function usePropertyConsoleTargets() {
  const selection = useConsoleSelection({ family: 'property' })

  const setPropertyConsoleTarget = (selectionPatch: PropertyConsoleTargetInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.propertyId,
    })
  }

  return {
    selectedId: selection.selectedId,
    setPropertyConsoleTarget,
    clearPropertyConsoleTarget: selection.clearSelection,
  }
}
