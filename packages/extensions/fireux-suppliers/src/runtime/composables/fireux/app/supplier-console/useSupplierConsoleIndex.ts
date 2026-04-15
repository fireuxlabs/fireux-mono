import { computed } from 'vue'
import { useSupplierCollection } from '../../firestore/supplier/fetch/useSupplierCollection'
import { getDemoSupplierScenarioList } from './demo-scenarios'
import { useSupplierConsole } from './useSupplierConsole'
import { useSupplierSelection } from './useSupplierSelection'

type UseSupplierConsoleIndexOptions = {
  publishHeader?: boolean
}

export function useSupplierConsoleIndex(
  options: UseSupplierConsoleIndexOptions = {}
) {
  const { supplier, consoleState } = useSupplierConsole({
    publishHeader: options.publishHeader,
  })
  const { setRuntimeSupplier } = useSupplierSelection()
  const { suppliers } = useSupplierCollection()

  const liveSuppliers = computed(() => suppliers.value ?? [])
  const demoSuppliers = computed(() => getDemoSupplierScenarioList())

  const selectSupplier = (supplierId: string) => {
    setRuntimeSupplier({ supplierId, mode: 'live' })
  }

  const selectDemoSupplier = (supplierId: string) => {
    setRuntimeSupplier({ supplierId, mode: 'demo' })
  }

  return {
    supplier,
    liveSuppliers,
    demoSuppliers,
    clearSelection: consoleState.clearSelection,
    selectSupplier,
    selectDemoSupplier,
  }
}