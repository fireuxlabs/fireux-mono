import { computed } from 'vue'
import {
  normalizeMode,
  normalizeString,
  type RuntimeKitchenMode,
} from './shared'
import { selectionKey, useRuntimeSelection } from 'fireux-core/runtime/composables/fireux/runtime/useRuntimeSelection'

type RuntimeKitchenSelectionState = {
  selectedId: string
  mode: RuntimeKitchenMode
}

type RuntimeKitchenSelectionInput = Partial<RuntimeKitchenSelectionState> & {
  kitchenId?: string
}

const COOKIE_KEY = 'fireux_runtime_kitchen'

const normalizeSelectionState = (value: unknown): RuntimeKitchenSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return {
    selectedId: normalizeString(source.selectedId ?? source.kitchenId),
    mode: normalizeMode(source.mode) ?? 'live',
  }
}

export function useRuntimeKitchenSelection() {
  const selection = useRuntimeSelection<RuntimeKitchenSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '', mode: 'live' }),
    normalizeState: normalizeSelectionState,
  })

  const setRuntimeKitchen = (selectionPatch: RuntimeKitchenSelectionInput = {}) => {
    const next: RuntimeKitchenSelectionState = {
      selectedId:
        selectionPatch.selectedId !== undefined || selectionPatch.kitchenId !== undefined
          ? normalizeString(selectionPatch.selectedId ?? selectionPatch.kitchenId)
          : selection.state.value.selectedId,
      mode:
        selectionPatch.mode !== undefined
          ? normalizeMode(selectionPatch.mode) ?? selection.state.value.mode
          : selection.state.value.mode,
    }

    selection.set(next)
  }

  const clearRuntimeKitchen = () => {
    selection.clear()
  }

  const selectedId = selectionKey(selection, 'selectedId')
  const mode = computed(() => normalizeMode(selection.state.value.mode) ?? 'live')

  return {
    selectedId,
    mode,
    runtimeKitchenId: selectedId,
    runtimeKitchenMode: mode,
    setRuntimeKitchen,
    clearRuntimeKitchen,
  }
}
