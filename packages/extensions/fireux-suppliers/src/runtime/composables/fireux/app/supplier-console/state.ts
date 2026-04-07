import { createRuntimeEntitySelection } from 'fireux-core/runtime/composables/fireux/runtime/useRuntimeSelection'

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

const useSupplierSelectionBase = createRuntimeEntitySelection<RuntimeSupplierMode, 'supplierId'>({
  cookieKey: COOKIE_KEY,
  aliasKey: 'supplierId',
  defaultMode: 'demo',
  normalizeMode,
  normalizeId: normalizeString,
})

export function useRuntimeSupplierSelection() {
  const selection = useSupplierSelectionBase()
  const setRuntimeSupplier = (selectionPatch: RuntimeSupplierSelectionInput = {}) =>
    selection.setSelection(selectionPatch)
  const clearRuntimeSupplier = () => selection.clearSelection()

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    runtimeSupplierId: selection.selectedId,
    runtimeSupplierMode: selection.mode,
    setRuntimeSupplier,
    clearRuntimeSupplier,
  }
}
