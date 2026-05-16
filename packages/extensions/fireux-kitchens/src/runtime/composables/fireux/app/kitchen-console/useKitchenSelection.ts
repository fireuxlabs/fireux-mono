import {
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'

type KitchenSelectionInput = {
  selectedId?: string
  kitchenId?: string
  mode?: ConsoleMode
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenSelection() {
  const { selectedId, selectedMode, selectEntity, clearSelection } =
    useConsole('kitchen')

  const setKitchenSelection = (selectionPatch: KitchenSelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.kitchenId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.kitchenId)
        : selectedId.value

    const nextMode = selectionPatch.mode ?? selectedMode.value

    selectEntity(nextId, nextMode)
  }

  const clearKitchenSelection = () => {
    clearSelection()
  }

  return {
    selectedId,
    mode: selectedMode,
    setKitchenSelection,
    clearKitchenSelection,
  }
}
