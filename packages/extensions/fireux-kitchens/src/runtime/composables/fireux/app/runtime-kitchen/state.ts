import { useState } from '#imports'
import { computed } from 'vue'
import {
  normalizeMode,
  normalizeString,
  RUNTIME_KITCHEN_ID_KEY,
  RUNTIME_KITCHEN_MODE_KEY,
  type RuntimeKitchenMode,
  type RuntimeKitchenSelection,
} from './shared'

export const useRuntimeKitchenState = () => {
  const runtimeKitchenIdState = useState<string>(RUNTIME_KITCHEN_ID_KEY, () => '')
  const runtimeKitchenModeState = useState<RuntimeKitchenMode>(RUNTIME_KITCHEN_MODE_KEY, () => 'dummy')
  return { runtimeKitchenIdState, runtimeKitchenModeState }
}

export function useRuntimeKitchenSelection() {
  const { runtimeKitchenIdState, runtimeKitchenModeState } = useRuntimeKitchenState()

  const setRuntimeKitchen = (selection: RuntimeKitchenSelection = {}) => {
    runtimeKitchenModeState.value = normalizeMode(selection.mode) ?? runtimeKitchenModeState.value ?? 'dummy'
    runtimeKitchenIdState.value = normalizeString(selection.kitchenId)
  }

  return {
    runtimeKitchenId: computed(() => runtimeKitchenIdState.value),
    runtimeKitchenMode: computed(() => runtimeKitchenModeState.value),
    setRuntimeKitchen,
  }
}
