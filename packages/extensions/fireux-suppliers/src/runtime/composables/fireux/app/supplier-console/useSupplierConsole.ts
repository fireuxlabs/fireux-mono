import { computed } from 'vue'
import { useConsoleState } from 'fireux-core/runtime/composables/fireux/console/useConsoleState'
import type { Supplier } from '../../../../models/supplier/Supplier.model'
import { useSupplierSelection } from './useSupplierSelection'
import { useActiveSupplier } from './useActiveSupplier'
import { useSupplierInterface } from '../../firestore/supplier/utils/view/useSupplierInterface'

type UseSupplierConsoleOptions = {
  publishHeader?: boolean
}

const normalizeString = (value: unknown): string => String(value || '').trim()
const family = 'supplier' as const
const resolveHeaderImageUrl = (
  value: { imageUrl?: string; avatarUrl?: string } | null | undefined
) => normalizeString(value?.imageUrl ?? value?.avatarUrl) || undefined

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
    toSupplierCard(supplierState.supplier.value as Supplier | null)
  )

  const headerData = computed(() =>
    supplier.value
      ? {
          imageUrl: resolveHeaderImageUrl(supplier.value),
          title: supplier.value.title,
          subtitle:
            normalizeString(supplier.value.subtitle) ||
            normalizeString(supplierState.supplier.value?.id),
        }
      : null
  )

  const consoleState = useConsoleState({
    family,
    selectedId: supplierState.id,
    mode: computed(() => 'live'),
    setMode: () => {},
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
