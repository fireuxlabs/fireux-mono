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
  const scenarios = computed(() => getReadOnlySupplierScenarios())
  const scenarioPills = computed(() =>
    scenarios.value
      .map((entry) => {
        const pill = supplierInterface({
          ...(entry.supplier ?? {}),
          id: String((entry.supplier as any)?.id || '').trim() || String(entry.id || '').trim(),
        } as Supplier)

        if (!pill) return null

        return {
          ...pill,
          avatarUrl: pill.avatarUrl || String((entry as any)?.image_url || '').trim(),
        }
      })
      .filter((entry): entry is NonNullable<ReturnType<typeof supplierInterface>> => Boolean(entry))
  )

  const activeSupplier = computed<Supplier | null>(() => {
    const currentId = String(runtime.id.value || '').trim()
    if (!currentId) return null

    const scenario = scenarios.value.find((entry) => String(entry.id || '').trim() === currentId)
    return scenario?.supplier ?? null
  })
  const activeSupplierPill = computed(() =>
    activeSupplier.value ? supplierInterface(activeSupplier.value as Supplier) : null
  )
  const hasActiveSupplier = computed(() => activeSupplier.value !== null)
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
    activeSupplier,
    activeSupplierPill,
    hasActiveSupplier,
    showSelector,
    pending: computed(() => false),
    setActiveScenario,
  }
}
