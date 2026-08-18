import { computed } from 'vue'
import { useSupplierConsole } from '../../core/useSupplierConsole'
import { useSupplierItemCollection } from '../../../firestore/fetch/useSupplierItemCollection'
import type { SupplierItemSurface } from '../../../item/useSupplierItemInterface'
import {
  findSupplierConsoleDemoScenario,
  useSupplierConsoleDemoData,
} from '../../core/useSupplierConsoleDemoData'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsoleItems() {
  const {
    selection,
    runtime,
  } = useSupplierConsole()

  const supplierLabel = computed(() =>
    normalizeString(selection.supplier.value?.supplier_organization_name)
  )

  const linkedIngredientIds = computed(() =>
    Array.isArray(selection.supplier.value?.linked_ingredient_ids)
      ? selection.supplier.value.linked_ingredient_ids
          .map((value) => normalizeString(value))
          .filter(Boolean)
      : []
  )

  const state = computed(() => normalizeString(selection.supplier.value?.state))
  const catalogueState = computed(() =>
    normalizeString(selection.supplier.value?.catalogue_state)
  )
  const supplierItemsEnabled = computed(() =>
    !runtime.isDemo.value
    && Boolean(runtime.rootCollection.value && selection.supplierId.value)
  )
  const {
    collectionPath: supplierItemsCollectionPath,
    supplierItems: supplierItemsFromStore,
    pending: supplierItemsPending,
  } = useSupplierItemCollection(selection.supplierId, {
    enabled: supplierItemsEnabled,
    supplierCollectionPath: runtime.rootCollection,
  })

  const demoData = useSupplierConsoleDemoData(
    runtime.isDemo
  )
  const demoScenario = computed(() => findSupplierConsoleDemoScenario(
    demoData.data.value,
    selection.supplierId.value
  ))
  const supplierItems = computed<SupplierItemSurface[]>(() =>
    runtime.isDemo.value
      ? demoScenario.value?.items ?? []
      : supplierItemsFromStore.value
  )
  const pending = computed(() =>
    runtime.isDemo.value
      ? demoData.pending.value
      : supplierItemsPending.value
  )

  const emptyTitle = computed(() => 'No supplier items yet')

  const emptyDescription = computed(() => {
    return 'No supplier-owned item rows are available for this supplier yet.'
  })

  const itemsTitle = computed(() =>
    supplierLabel.value ? `${supplierLabel.value} Items` : 'Items'
  )

  const itemsDescription = computed(() => {
    const parts = [
      `state: ${state.value || 'missing'}`,
      `catalogue: ${catalogueState.value || 'missing'}`,
      `${linkedIngredientIds.value.length} linked ingredients`,
    ]

    return parts.join(' · ')
  })

  const devJsonContext = computed(
    () => 'console supplier · items'
  )
  const debug = computed(() => ({
    supplierId: selection.supplierId.value,
    supplierName: supplierLabel.value,
    supplierItemsCollectionPath: supplierItemsCollectionPath.value,
    supplierItemsCount: supplierItems.value.length,
    pending: pending.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
  }))

  return {
    selectedSupplier: selection.supplier,
    supplierId: selection.supplierId,
    supplierLabel,
    linkedIngredientIds,
    state,
    catalogueState,
    supplierItemsCollectionPath,
    supplierItems,
    pending,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    emptyTitle,
    emptyDescription,
    itemsTitle,
    itemsDescription,
    devJsonContext,
    debug,
  }
}

export type SupplierConsoleItemsState = ReturnType<
  typeof useSupplierConsoleItems
>
