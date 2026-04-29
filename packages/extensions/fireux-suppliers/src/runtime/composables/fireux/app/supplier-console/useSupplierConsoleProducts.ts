import { computed } from 'vue'
import { useSupplierConsole } from './useSupplierConsole'
import { getDemoSupplierProductItems } from '../utils/supplier-demo-scenarios'
import { useSupplierProductCollection } from '../../firestore/supplier/fetch/useSupplierProductCollection'
import type { SupplierProductInterfaceItem } from '../../firestore/supplier/utils/view/useSupplierProductInterface'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsoleProducts() {
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
  const supplierProductsEnabled = computed(() =>
    Boolean(rootCollection.value && supplierId.value)
  )
  const {
    collectionPath: supplierProductsCollectionPath,
    supplierProducts,
    pending: supplierProductsPending,
  } = useSupplierProductCollection(supplierId, {
    enabled: supplierProductsEnabled,
    supplierCollectionPath: rootCollection,
  })

  const productItems = computed<SupplierProductInterfaceItem[]>(() =>
    selectedMode.value === 'demo' && supplierId.value
      ? getDemoSupplierProductItems(supplierId.value)
      : rootCollection.value
        ? supplierProducts.value
        : []
  )
  const pending = computed(() =>
    rootCollection.value ? supplierProductsPending.value : false
  )

  const emptyTitle = computed(() => {
    if (selectedMode.value === 'live') return 'No live supplier products yet'
    if (selectedMode.value === 'test') return 'No test supplier products yet'
    return 'No supplier products available'
  })

  const emptyDescription = computed(() => {
    if (selectedMode.value === 'live') {
      return 'No supplier-owned product rows are available for this supplier yet.'
    }

    if (selectedMode.value === 'test') {
      return 'This test supplier does not have any product rows yet.'
    }

    return 'No supplier products are available for the selected supplier.'
  })

  const modeLabel = computed(() => {
    if (selectedMode.value === 'demo') return 'Demo'
    if (selectedMode.value === 'test') return 'Test'
    return 'Live'
  })

  const productsTitle = computed(() =>
    supplierLabel.value ? `${supplierLabel.value} Products` : 'Supplier Products'
  )

  const productsDescription = computed(() => {
    const parts = [
      modeLabel.value,
      `state: ${state.value || 'missing'}`,
      `catalogue: ${catalogueState.value || 'missing'}`,
      `${linkedIngredientIds.value.length} linked ingredients`,
    ]

    return parts.join(' · ')
  })

  const devJsonContext = computed(
    () => `console supplier · products · ${selectedMode.value}`
  )

  return {
    selectedSupplier,
    selectedMode,
    supplierId,
    supplierLabel,
    linkedIngredientIds,
    state,
    catalogueState,
    supplierProductsCollectionPath,
    productItems,
    pending,
    canWrite,
    emptyTitle,
    emptyDescription,
    modeLabel,
    productsTitle,
    productsDescription,
    devJsonContext,
  }
}

export type SupplierConsoleProductsState = ReturnType<
  typeof useSupplierConsoleProducts
>
