import { computed } from 'vue'
import { selectionKey, useRuntimeSelection } from 'fireux-core/runtime/composables/fireux/runtime/useRuntimeSelection'

export type RuntimeSupplierMode = 'live' | 'demo' | 'test'

type RuntimeSupplierSelectionState = {
  selectedId: string
  mode: RuntimeSupplierMode
}

type RuntimeSupplierSelectionInput = Partial<RuntimeSupplierSelectionState> & {
  supplierId?: string
}

const COOKIE_KEY = 'fireux_runtime_supplier'

const normalizeString = (value: unknown): string => String(value || '').trim()

const normalizeMode = (value: unknown): RuntimeSupplierMode => {
  const normalized = normalizeString(value).toLowerCase()
  if (normalized === 'demo') return 'demo'
  if (normalized === 'live' || normalized === 'test') return normalized
  return 'demo'
}

const normalizeSelectionState = (value: unknown): RuntimeSupplierSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return {
    selectedId: normalizeString(source.selectedId ?? source.supplierId),
    mode: normalizeMode(source.mode),
  }
}

export function useRuntimeSupplierSelection() {
  const selection = useRuntimeSelection<RuntimeSupplierSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '', mode: 'demo' }),
    normalizeState: normalizeSelectionState,
  })

  const setRuntimeSupplier = (selectionPatch: RuntimeSupplierSelectionInput = {}) => {
    const next: RuntimeSupplierSelectionState = {
      selectedId:
        selectionPatch.selectedId !== undefined || selectionPatch.supplierId !== undefined
          ? normalizeString(selectionPatch.selectedId ?? selectionPatch.supplierId)
          : selection.state.value.selectedId,
      mode:
        selectionPatch.mode !== undefined
          ? normalizeMode(selectionPatch.mode)
          : selection.state.value.mode,
    }

    selection.set(next)
  }

  const clearRuntimeSupplier = () => {
    selection.clear()
  }

  const selectedId = selectionKey(selection, 'selectedId')
  const mode = computed<RuntimeSupplierMode>(() =>
    normalizeMode(selection.state.value.mode)
  )

  return {
    selectedId,
    mode,
    runtimeSupplierId: selectedId,
    runtimeSupplierMode: mode,
    setRuntimeSupplier,
    clearRuntimeSupplier,
  }
}
