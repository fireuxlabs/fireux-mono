import { useCookie, useState } from '#imports'
import { computed } from 'vue'
import {
  normalizeMode,
  normalizeString,
  type RuntimeKitchenMode,
} from './shared'

type RuntimeKitchenSelectionState = {
  kitchenId: string
  mode: RuntimeKitchenMode
}

const COOKIE_KEY = 'fireux_runtime_kitchen'

const normalizeSelectionState = (value: unknown): RuntimeKitchenSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return {
    kitchenId: normalizeString(source.kitchenId),
    mode: normalizeMode(source.mode) ?? 'live',
  }
}

export function useRuntimeKitchenSelection() {
  const cookie = useCookie<RuntimeKitchenSelectionState>(COOKIE_KEY, {
    default: () => ({ kitchenId: '', mode: 'live' }),
    sameSite: 'lax',
  })

  const runtimeKitchenState = useState<RuntimeKitchenSelectionState>(COOKIE_KEY, () =>
    normalizeSelectionState(cookie.value)
  )

  cookie.value = normalizeSelectionState(runtimeKitchenState.value)

  const setRuntimeKitchen = (selection: Partial<RuntimeKitchenSelectionState> = {}) => {
    const next: RuntimeKitchenSelectionState = {
      kitchenId:
        selection.kitchenId !== undefined
          ? normalizeString(selection.kitchenId)
          : runtimeKitchenState.value.kitchenId,
      mode:
        selection.mode !== undefined
          ? normalizeMode(selection.mode) ?? runtimeKitchenState.value.mode
          : runtimeKitchenState.value.mode,
    }

    runtimeKitchenState.value = next
    cookie.value = next
  }

  const clearRuntimeKitchen = () => {
    const next: RuntimeKitchenSelectionState = { kitchenId: '', mode: 'live' }
    runtimeKitchenState.value = next
    cookie.value = next
  }

  return {
    runtimeKitchenId: computed(() => runtimeKitchenState.value.kitchenId),
    runtimeKitchenMode: computed(() => normalizeMode(runtimeKitchenState.value.mode) ?? 'live'),
    setRuntimeKitchen,
    clearRuntimeKitchen,
  }
}
