import { computed, unref, type Ref } from 'vue'
import type { RuntimeAppMode } from './shared'
import { normalizeMode, normalizeString } from './shared'
import type { useRuntimeAppSelection } from './state'

export type UseRuntimeAppParams = {
  appId?: string | Ref<string | null | undefined>
  mode?: RuntimeAppMode | Ref<RuntimeAppMode | null | undefined>
}

export function useRuntimeAppContext(
  params: UseRuntimeAppParams | undefined,
  selection: ReturnType<typeof useRuntimeAppSelection>
) {
  const idSource = computed(() =>
    params?.appId !== undefined ? normalizeString(unref(params.appId)) : String(selection.runtimeAppId.value || '')
  )

  const modeSource = computed(() =>
    params?.mode !== undefined ? unref(params.mode) : selection.runtimeAppMode.value
  )

  const id = computed(() => normalizeString(idSource.value) || '')
  const mode = computed<RuntimeAppMode>(() => normalizeMode(modeSource.value) ?? 'live')
  const isReadOnly = computed(() => mode.value === 'read-only')

  return { id, mode, isReadOnly }
}
