import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type KitchenConsoleTargetInput = {
  selectedId?: string
  kitchenId?: string
}

export function useKitchenConsoleTargets() {
  const selection = useConsoleSelection({ family: 'kitchen' })

  const setKitchenConsoleTarget = (selectionPatch: KitchenConsoleTargetInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.kitchenId,
    })
  }

  return {
    selectedId: selection.selectedId,
    setKitchenConsoleTarget,
    clearKitchenConsoleTarget: selection.clearSelection,
  }
}
