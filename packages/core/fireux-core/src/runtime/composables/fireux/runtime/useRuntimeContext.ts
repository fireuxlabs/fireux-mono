import { computed, unref, type Ref } from 'vue'
import { normalizeRuntimeMode, normalizeString } from './runtime.normalize'
import type { RuntimeContextRef, RuntimeMode } from './runtime.types'

export type UseRuntimeContextParams = {
  id?: string | Ref<string | null | undefined>
  mode?: RuntimeMode | Ref<RuntimeMode | null | undefined>
}

/**
 * Shared context resolver:
 * - supports params override
 * - otherwise uses selection getters
 * - always returns { id, mode, isReadOnly }
 */
export function useRuntimeContext(params: UseRuntimeContextParams | undefined, selection: {
  runtimeId: Ref<string> | { value: string }
  runtimeMode: Ref<RuntimeMode> | { value: RuntimeMode }
}): RuntimeContextRef {
  const idSource = computed(() =>
    params?.id !== undefined ? unref(params.id) : (selection.runtimeId as any).value
  )

  const modeSource = computed(() =>
    params?.mode !== undefined ? unref(params.mode) : (selection.runtimeMode as any).value
  )

  const id = computed(() => normalizeString(idSource.value) || '')
  const mode = computed<RuntimeMode>(() => normalizeRuntimeMode(modeSource.value))
  const isReadOnly = computed(() => mode.value === 'read-only')

  return { id, mode, isReadOnly }
}
