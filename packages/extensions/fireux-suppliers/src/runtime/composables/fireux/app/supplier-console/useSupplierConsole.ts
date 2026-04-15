import { computed } from 'vue'
import type { Supplier } from '../../../../models/supplier/Supplier.model'
import { useSupplierSelection } from './useSupplierSelection'
import { useActiveSupplier } from './useActiveSupplier'
import { useSupplierInterface } from '../../firestore/supplier/utils/view/useSupplierInterface'
import { useConsoleEntityAdapter } from 'fireux-core/runtime/composables/fireux/console/useConsoleEntityAdapter'

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

  const { headerData, consoleState } = useConsoleEntityAdapter({
    family: 'suppliers',
    selectedId: supplierState.id,
    mode: supplierState.mode,
    setMode: (mode) => supplierSelection.setRuntimeSupplier({ mode }),
    clearSelection: supplierSelection.clearRuntimeSupplier,
    card: supplier,
    publishHeader: options.publishHeader,
  })

  return {
    supplierState,
    supplier,
    headerData,
    consoleState,
  }
}
