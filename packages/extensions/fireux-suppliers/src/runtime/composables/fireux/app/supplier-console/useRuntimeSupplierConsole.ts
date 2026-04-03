import { computed } from 'vue'
import { useSupplierInterface } from '../../firestore/supplier/utils/view/useSupplierInterface'
import type { Supplier } from '../../../models/supplier/Supplier.model'
import { getReadOnlySupplierScenarios } from './read-only-scenarios'
import { useRuntimeSupplierSelection } from './state'
import { useRuntimeSupplier } from './useRuntimeSupplier'

/**
 * Demo-only supplier console.
 */
export function useRuntimeSupplierConsole() {
  const runtime = useRuntimeSupplier()
  const { setRuntimeSupplier } = useRuntimeSupplierSelection()
  const { interface: supplierInterface } = useSupplierInterface()
  const scenarios = computed(getReadOnlySupplierScenarios)

  const toSupplierPill = (
    supplier: Partial<Supplier> | null | undefined,
    options: { id?: string; avatarUrl?: unknown } = {}
  ) => {
    const pill = supplierInterface({
      ...(supplier ?? {}),
      ...(options.id ? { id: options.id } : {}),
    } as Supplier)

    if (!pill) return null

    const avatarUrl = String(options.avatarUrl || '').trim()
    return avatarUrl && !pill.avatarUrl ? { ...pill, avatarUrl } : pill
  }

  const scenarioPills = computed(() =>
    scenarios.value
      .map((entry) =>
        toSupplierPill(entry.supplier, {
          id: String((entry.supplier as any)?.id || '').trim() || String(entry.id || '').trim(),
          avatarUrl: String((entry as any)?.image_url || '').trim(),
        })
      )
      .filter((entry): entry is NonNullable<ReturnType<typeof supplierInterface>> => Boolean(entry))
  )

  const activeSupplierPill = computed(() =>
    toSupplierPill(runtime.supplier.value)
  )
  const showSelector = computed(() => scenarios.value.length > 1)

  const setActiveScenario = (supplierId: string) => {
    const resolvedId = String(supplierId || '').trim()
    if (!resolvedId) return
    setRuntimeSupplier({
      supplierId: resolvedId,
      mode: 'read-only',
    })
  }

  return {
    runtime,
    scenarios,
    scenarioPills,
    activeSupplierPill,
    showSelector,
    setActiveScenario,
  }
}
