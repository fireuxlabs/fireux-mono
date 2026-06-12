import { computed } from 'vue'
import { useSupplierConsole } from '../../core/useSupplierConsole'
import { useSupplierItemCollection } from '../../../../firestore/supplier/fetch/useSupplierItemCollection'
import type { SupplierItemSurface } from '../../../../firestore/supplier/utils/view/useSupplierItemInterface'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsoleItems() {
  const {
    selectedSupplier,
    supplierId,
    rootCollection,
    canWrite,
  } = useSupplierConsole()

  const supplierLabel = computed(() =>
    normalizeString(selectedSupplier.value?.supplier_organization_name)
  )

  const linkedIngredientIds = computed(() =>
    Array.isArray(selectedSupplier.value?.linked_ingredient_ids)
      ? selectedSupplier.value.linked_ingredient_ids
          .map((value) => normalizeString(value))
          .filter(Boolean)
      : []
  )

  const state = computed(() => normalizeString(selectedSupplier.value?.state))
  const catalogueState = computed(() =>
    normalizeString(selectedSupplier.value?.catalogue_state)
  )
  const supplierItemsEnabled = computed(() =>
    Boolean(rootCollection.value && supplierId.value)
  )
  const {
    collectionPath: supplierItemsCollectionPath,
    supplierItems: supplierItemsFromStore,
    pending: supplierItemsPending,
  } = useSupplierItemCollection(supplierId, {
    enabled: supplierItemsEnabled,
    supplierCollectionPath: rootCollection,
  })

  const supplierItems = computed<SupplierItemSurface[]>(() =>
    rootCollection.value
        ? supplierItemsFromStore.value
        : []
  )
  const pending = computed(() =>
    rootCollection.value ? supplierItemsPending.value : false
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
    supplierId: supplierId.value,
    supplierName: supplierLabel.value,
    supplierItemsCollectionPath: supplierItemsCollectionPath.value,
    supplierItemsCount: supplierItems.value.length,
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedSupplier,
    supplierId,
    supplierLabel,
    linkedIngredientIds,
    state,
    catalogueState,
    supplierItemsCollectionPath,
    supplierItems,
    pending,
    canWrite,
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
