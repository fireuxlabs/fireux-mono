import { computed, unref, type Ref } from 'vue'
import { normalizeMode, normalizeString, type RuntimeKitchenMode } from './shared'
import type { useRuntimeKitchenSelection } from './state'

export type UseRuntimeKitchenParams = {
  kitchenId?: string | Ref<string | null | undefined>
  mode?: RuntimeKitchenMode | Ref<RuntimeKitchenMode | null | undefined>
}

export function useRuntimeKitchenContext(
  params: UseRuntimeKitchenParams | undefined,
  selection: ReturnType<typeof useRuntimeKitchenSelection>
) {
  const kitchenIdSource = computed(() =>
    params?.kitchenId !== undefined ? unref(params.kitchenId) : selection.runtimeKitchenId.value
  )

  const modeSource = computed(() =>
    params?.mode !== undefined ? unref(params.mode) : selection.runtimeKitchenMode.value
  )

  const id = computed(() => normalizeString(kitchenIdSource.value) || '')
  const mode = computed<RuntimeKitchenMode>(() => normalizeMode(modeSource.value) ?? 'read-only')
  const isReadOnly = computed(() => mode.value === 'read-only')

  return { id, mode, isReadOnly }
}
