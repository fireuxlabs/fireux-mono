import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/composables/fireux/console/console.normalize'
import { useConsoleState } from 'fireux-core/runtime/composables/fireux/console/useConsoleState'
import type { Supplier } from '../../../../models/supplier/Supplier.model'
import { useSupplierSelection } from './useSupplierSelection'
import { useActiveSupplier } from './useActiveSupplier'
import { useSupplierInterface } from '../../firestore/supplier/utils/view/useSupplierInterface'

type UseSupplierConsoleOptions = {
  publishHeader?: boolean
}

/**
 * Supplier console adapter.
 * Keeps only the active pill, header data, and shared console-state wiring.
 */
export function useSupplierConsole(
  options: UseSupplierConsoleOptions = {}
) {
  const supplierState = useActiveSupplier()
  const supplierSelection = useSupplierSelection()
  const { pill: toSupplierCard } = useSupplierInterface()
  const supplier = computed(() =>
    toSupplierCard(supplierState.entity.value as Supplier | null)
  )

  const headerData = computed(() => {
    const card = supplier.value
    if (!card) return null

    return {
      imageUrl: normalizeString(card.imageUrl ?? card.avatarUrl) || undefined,
      title: card.title,
      subtitle:
        normalizeString(card.subtitle) || normalizeString(supplierState.id.value) || undefined,
    }
  })
  const consoleState = useConsoleState({
    family: 'suppliers',
    selectedId: supplierState.id,
    mode: supplierState.mode,
    setMode: (mode) => supplierSelection.setRuntimeSupplier({ mode }),
    clearSelection: supplierSelection.clearRuntimeSupplier,
    header: headerData,
    publishHeader: options.publishHeader,
  })

  return {
    supplierState,
    supplier,
    headerData,
    consoleState,
  }
}
