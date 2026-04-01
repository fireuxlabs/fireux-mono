import { computed, unref, type Ref } from 'vue'
import { normalizeRuntimeMode, normalizeString } from 'fireux-core/runtime/composables/fireux/runtime/runtime.normalize'
import type { RuntimeMode } from 'fireux-core/runtime/composables/fireux/runtime/runtime.types'
import type { useRuntimeProjectSelection } from './state'

export type UseRuntimeProjectParams = {
  projectId?: string | Ref<string | null | undefined>
  mode?: RuntimeMode | Ref<RuntimeMode | null | undefined>
  collectionPath?: string | Ref<string | null | undefined>
}

export function useRuntimeProjectContext(
  params: UseRuntimeProjectParams | undefined,
  selection: ReturnType<typeof useRuntimeProjectSelection>
) {
  const projectIdSource = computed(() =>
    params?.projectId !== undefined ? unref(params.projectId) : selection.runtimeProjectId.value
  )

  const modeSource = computed(() =>
    params?.mode !== undefined ? unref(params.mode) : selection.runtimeProjectMode.value
  )

  const id = computed(() => normalizeString(projectIdSource.value) || '')
  const mode = computed<RuntimeMode>(() => normalizeRuntimeMode(modeSource.value) ?? 'read-only')
  const isReadOnly = computed(() => mode.value === 'read-only')

  return { id, mode, isReadOnly }
}
