import { computed, unref, type Ref } from 'vue'
import type { RuntimeSupplierMode } from './state'
import type { useRuntimeSupplierSelection } from './state'

const normalizeString = (value: unknown): string => String(value || '').trim()

export type UseRuntimeSupplierParams = {
  supplierId?: string | Ref<string | null | undefined>
  mode?: RuntimeSupplierMode | Ref<RuntimeSupplierMode | null | undefined>
}

export function useRuntimeSupplierContext(
  params: UseRuntimeSupplierParams | undefined,
  selection: ReturnType<typeof useRuntimeSupplierSelection>
) {
  const supplierIdSource = computed(() =>
    params?.supplierId !== undefined ? unref(params.supplierId) : selection.runtimeSupplierId.value
  )

  const modeSource = computed(() =>
    params?.mode !== undefined ? unref(params.mode) : selection.runtimeSupplierMode.value
  )

  const id = computed(() => normalizeString(supplierIdSource.value) || '')
  const mode = computed<RuntimeSupplierMode>(() => {
    const normalized = normalizeString(modeSource.value).toLowerCase()
    if (normalized === 'dummy' || normalized === 'readonly') return 'read-only'
    return 'read-only'
  })
  const isReadOnly = computed(() => mode.value === 'read-only')

  return { id, mode, isReadOnly }
}
