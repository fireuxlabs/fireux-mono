import {
  normalizeMode,
  normalizeString,
  type RuntimeKitchenMode,
} from './shared'
import { createRuntimeEntitySelection } from 'fireux-core/runtime/composables/fireux/runtime/useRuntimeSelection'

type RuntimeKitchenSelectionState = {
  selectedId: string
  mode: RuntimeKitchenMode
}

type RuntimeKitchenSelectionInput = Partial<RuntimeKitchenSelectionState> & {
  kitchenId?: string
}

const COOKIE_KEY = 'fireux_runtime_kitchen'
const useKitchenSelectionBase = createRuntimeEntitySelection<RuntimeKitchenMode, 'kitchenId'>({
  cookieKey: COOKIE_KEY,
  aliasKey: 'kitchenId',
  defaultMode: 'demo',
  normalizeMode: (value) => normalizeMode(value) ?? 'demo',
  normalizeId: normalizeString,
})

export function useRuntimeKitchenSelection() {
  const selection = useKitchenSelectionBase()
  const setRuntimeKitchen = (selectionPatch: RuntimeKitchenSelectionInput = {}) =>
    selection.setSelection(selectionPatch)
  const clearRuntimeKitchen = () => selection.clearSelection()

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    runtimeKitchenId: selection.selectedId,
    runtimeKitchenMode: selection.mode,
    setRuntimeKitchen,
    clearRuntimeKitchen,
  }
}
