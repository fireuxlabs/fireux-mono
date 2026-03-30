import { useCookie, useState } from '#imports'
import { computed } from 'vue'

export type RuntimeSupplierMode = 'live' | 'read-only'

type RuntimeSupplierSelectionState = {
  supplierId: string
  mode: RuntimeSupplierMode
}

const COOKIE_KEY = 'fireux_runtime_supplier'

const normalizeString = (value: unknown): string => String(value || '').trim()

const normalizeMode = (value: unknown): RuntimeSupplierMode => {
  const normalized = normalizeString(value).toLowerCase()
  if (normalized === 'dummy' || normalized === 'readonly') return 'read-only'
  if (normalized === 'read-only' || normalized === 'live') return normalized
  return 'live'
}

const normalizeSelectionState = (value: unknown): RuntimeSupplierSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return {
    supplierId: normalizeString(source.supplierId),
    mode: normalizeMode(source.mode),
  }
}

export function useRuntimeSupplierSelection() {
  const cookie = useCookie<RuntimeSupplierSelectionState>(COOKIE_KEY, {
    default: () => ({ supplierId: '', mode: 'live' }),
    path: '/',
    sameSite: 'lax',
  })

  const runtimeSupplierState = useState<RuntimeSupplierSelectionState>(COOKIE_KEY, () =>
    normalizeSelectionState(cookie.value)
  )

  cookie.value = normalizeSelectionState(runtimeSupplierState.value)

  const setRuntimeSupplier = (selection: Partial<RuntimeSupplierSelectionState> = {}) => {
    const next: RuntimeSupplierSelectionState = {
      supplierId:
        selection.supplierId !== undefined
          ? normalizeString(selection.supplierId)
          : runtimeSupplierState.value.supplierId,
      mode:
        selection.mode !== undefined
          ? normalizeMode(selection.mode)
          : runtimeSupplierState.value.mode,
    }

    runtimeSupplierState.value = next
    cookie.value = next
  }

  const clearRuntimeSupplier = () => {
    const next: RuntimeSupplierSelectionState = {
      supplierId: '',
      mode: 'live',
    }
    runtimeSupplierState.value = next
    cookie.value = next
  }

  return {
    runtimeSupplierId: computed(() => runtimeSupplierState.value.supplierId),
    runtimeSupplierMode: computed<RuntimeSupplierMode>(() =>
      normalizeMode(runtimeSupplierState.value.mode)
    ),
    setRuntimeSupplier,
    clearRuntimeSupplier,
  }
}
