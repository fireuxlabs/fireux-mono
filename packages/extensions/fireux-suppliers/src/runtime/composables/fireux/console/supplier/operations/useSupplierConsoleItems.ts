import { computed } from 'vue'
import { useSupplierConsole } from '../useSupplierConsole'
import { getDemoSupplierItems } from '../../../app/utils/supplier-demo-scenarios'
import { useSupplierItemCollection } from '../../../firestore/supplier/fetch/useSupplierItemCollection'
import type { SupplierItemSurface } from '../../../firestore/supplier/utils/view/useSupplierItemInterface'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsoleItems() {
  const {
    selectedSupplier,
    selectedMode,
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
    selectedMode.value === 'demo' && supplierId.value
      ? getDemoSupplierItems(supplierId.value)
      : rootCollection.value
        ? supplierItemsFromStore.value
        : []
  )
  const pending = computed(() =>
    rootCollection.value ? supplierItemsPending.value : false
  )

  const emptyTitle = computed(() => {
    if (selectedMode.value === 'live') return 'No live supplier items yet'
    if (selectedMode.value === 'test') return 'No test supplier items yet'
    return 'No supplier items available'
  })

  const emptyDescription = computed(() => {
    if (selectedMode.value === 'live') {
      return 'No supplier-owned item rows are available for this supplier yet.'
    }

    if (selectedMode.value === 'test') {
      return 'This test supplier does not have any item rows yet.'
    }

    return 'No supplier items are available for the selected supplier.'
  })

  const modeLabel = computed(() => {
    if (selectedMode.value === 'demo') return 'Demo'
    if (selectedMode.value === 'test') return 'Test'
    return 'Live'
  })

  const itemsTitle = computed(() =>
    supplierLabel.value ? `${supplierLabel.value} Items` : 'Supplier Items'
  )

  const itemsDescription = computed(() => {
    const parts = [
      modeLabel.value,
      `state: ${state.value || 'missing'}`,
      `catalogue: ${catalogueState.value || 'missing'}`,
      `${linkedIngredientIds.value.length} linked ingredients`,
    ]

    return parts.join(' · ')
  })

  const devJsonContext = computed(
    () => `console supplier · items · ${selectedMode.value}`
  )
  const debug = computed(() => ({
    mode: selectedMode.value,
    supplierId: supplierId.value,
    supplierName: supplierLabel.value,
    supplierItemsCollectionPath: supplierItemsCollectionPath.value,
    supplierItemsCount: supplierItems.value.length,
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedSupplier,
    selectedMode,
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
    modeLabel,
    itemsTitle,
    itemsDescription,
    devJsonContext,
    debug,
  }
}

export type SupplierConsoleItemsState = ReturnType<
  typeof useSupplierConsoleItems
>
