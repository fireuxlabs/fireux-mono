import { computed } from 'vue'
import { useConsoleState } from 'fireux-core/runtime/composables/fireux/console/useConsoleState'
import type { Supplier } from '../../../models/supplier/Supplier.model'
import { useSupplierSelection } from './useSupplierSelection'
import { useActiveSupplier } from './useActiveSupplier'
import { useSupplierInterface } from '../../firestore/supplier/utils/view/useSupplierInterface'

type UseRuntimeSupplierConsoleOptions = {
  publishHeader?: boolean
}

/**
 * Root supplier console inputs.
 */
export function useSupplierConsole(
  options: UseRuntimeSupplierConsoleOptions = {}
) {
  const runtime = useActiveSupplier()
  const supplierSelection = useSupplierSelection()
  const { interface: toSupplierCard } = useSupplierInterface()
  const activeSupplierPill = computed(() =>
    toSupplierCard(runtime.supplier.value as Supplier | null)
  )

  const headerData = computed(() =>
    activeSupplierPill.value
      ? {
          imageUrl: activeSupplierPill.value.avatarUrl,
          title: activeSupplierPill.value.title,
          subtitle: activeSupplierPill.value.subtitle,
        }
      : null
  )

  const consoleState = useConsoleState({
    family: 'supplier',
    selectedId: runtime.id,
    mode: computed(() => 'live'),
    setMode: () => {},
    clearSelection: supplierSelection.clearRuntimeSupplier,
    header: headerData,
    publishHeader: options.publishHeader,
    modeOptions: [{ value: 'live', label: 'Real' }],
  })

  return {
    runtime,
    activeSupplierPill,
    headerData,
    consoleState,
  }
}
