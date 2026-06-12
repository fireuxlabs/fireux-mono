import { computed } from 'vue'
import { useSupplierCatalogueCollection } from '../../../../firestore/supplier/fetch/useSupplierCatalogueCollection'
import { useSupplierItemCollection } from '../../../../firestore/supplier/fetch/useSupplierItemCollection'
import { useSupplierConsole } from '../../core/useSupplierConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsoleCatalogue() {
  const {
    selectedSupplier,
    supplierId,
    rootCollection,
    canWrite,
  } = useSupplierConsole()

  const supplierLabel = computed(() =>
    normalizeString(selectedSupplier.value?.supplier_organization_name)
  )

  const state = computed(() => normalizeString(selectedSupplier.value?.state))
  const catalogueState = computed(() =>
    normalizeString(selectedSupplier.value?.catalogue_state)
  )
  const supplierCataloguesEnabled = computed(() =>
    Boolean(rootCollection.value && supplierId.value)
  )
  const {
    collectionPath: supplierCataloguesCollectionPath,
    supplierCatalogues,
    pending: supplierCataloguesPending,
  } = useSupplierCatalogueCollection(supplierId, {
    enabled: supplierCataloguesEnabled,
    supplierCollectionPath: rootCollection,
  })

  const {
    supplierItems: supplierItemsFromStore,
    pending: supplierItemsPending,
  } = useSupplierItemCollection(supplierId, {
    enabled: supplierCataloguesEnabled,
    supplierCollectionPath: rootCollection,
  })

  const supplierItems = computed(() => supplierItemsFromStore.value)
  const rawCatalogues = computed(() => supplierCatalogues.value)
  const catalogues = computed(() =>
    rawCatalogues.value.map((catalogue) => ({
      ...catalogue,
      supplier_items: supplierItems.value,
    }))
  )
  const pending = computed(() =>
    supplierCataloguesPending.value || supplierItemsPending.value
  )

  const isIntegratedCatalogue = computed(
    () => catalogueState.value === 'integrated'
  )
  const isPublicOnlySupplier = computed(
    () => catalogueState.value === 'public_only'
  )

  const emptyTitle = computed(() => {
    if (isPublicOnlySupplier.value) return 'Public supplier only'
    return 'No catalogue items yet'
  })

  const emptyDescription = computed(() => {
    if (isPublicOnlySupplier.value) {
      return 'This supplier is linked as a useful public record, but it does not own an integrated supplier catalogue yet.'
    }

    return 'No supplier catalogue grouping rows are available for this supplier yet.'
  })

  const catalogueTitle = computed(() =>
    supplierLabel.value ? `${supplierLabel.value} Catalogue` : 'Supplier Catalogue'
  )

  const catalogueDescription = computed(() => {
    const parts = [
      `state: ${state.value || 'missing'}`,
      `catalogue: ${catalogueState.value || 'missing'}`,
    ]

    return parts.join(' · ')
  })

  const devJsonContext = computed(
    () => 'console supplier · catalogue'
  )
  const debug = computed(() => ({
    supplierId: supplierId.value,
    supplierName: supplierLabel.value,
    rootCollection: rootCollection.value,
    state: state.value,
    catalogueState: catalogueState.value,
    supplierCataloguesCollectionPath: supplierCataloguesCollectionPath.value,
    supplierItemsCount: supplierItems.value.length,
    catalogueItemsCount: catalogues.value.length,
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedSupplier,
    supplierId,
    supplierLabel,
    rootCollection,
    state,
    catalogueState,
    supplierCataloguesCollectionPath,
    catalogues,
    pending,
    canWrite,
    isIntegratedCatalogue,
    isPublicOnlySupplier,
    emptyTitle,
    emptyDescription,
    catalogueTitle,
    catalogueDescription,
    devJsonContext,
    debug,
  }
}

export type SupplierConsoleCatalogueState = ReturnType<
  typeof useSupplierConsoleCatalogue
>
