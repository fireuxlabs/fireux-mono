import {
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'

type PropertySelectionInput = {
  selectedId?: string
  propertyId?: string
  mode?: ConsoleMode
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePropertySelection() {
  const { selectedId, selectedMode, selectEntity, clearSelection } =
    useConsole('property')

  const setPropertySelection = (selectionPatch: PropertySelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.propertyId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.propertyId)
        : selectedId.value

    const nextMode = selectionPatch.mode ?? selectedMode.value

    selectEntity(nextId, nextMode)
  }

  const clearPropertySelection = () => {
    clearSelection()
  }

  return {
    selectedId,
    mode: selectedMode,
    setPropertySelection,
    clearPropertySelection,
  }
}
