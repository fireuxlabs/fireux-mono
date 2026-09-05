import { computed } from 'vue'
import { SupplierStorage } from '../../../../models/Supplier.model'
import { useSupplierCatalogueCollection } from '../../../firestore/fetch/useSupplierCatalogueCollection'
import { useSupplierItemCollection } from '../../../firestore/fetch/useSupplierItemCollection'
import { useSupplierWorkspace } from '../../core/useSupplierWorkspace'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierWorkspaceCatalogue() {
  const workspace = useSupplierWorkspace()
  const rootCollection = computed(() => SupplierStorage.collection)

  const supplierLabel = computed(() =>
    normalizeString(
      workspace.data.value?.company_place?.short_name ||
        workspace.data.value?.company_place?.name
    )
  )

  const state = computed(() => normalizeString(workspace.data.value?.status))
  const catalogueState = computed(() =>
    normalizeString(workspace.data.value?.catalogue_state)
  )
  const supplierCataloguesEnabled = computed(
    () => Boolean(rootCollection.value && workspace.id.value)
  )
  const {
    collectionPath: supplierCataloguesCollectionPath,
    supplierCatalogues,
    pending: supplierCataloguesPending,
  } = useSupplierCatalogueCollection(workspace.id, {
    enabled: supplierCataloguesEnabled,
    supplierCollectionPath: rootCollection,
  })

  const {
    supplierItems: supplierItemsFromStore,
    pending: supplierItemsPending,
  } = useSupplierItemCollection(workspace.id, {
    enabled: supplierCataloguesEnabled,
    supplierCollectionPath: rootCollection,
  })

  const supplierItems = supplierItemsFromStore
  const rawCatalogues = supplierCatalogues
  const catalogues = computed(() =>
    rawCatalogues.value.map((catalogue) => ({
      ...catalogue,
      supplier_items: supplierItems.value,
    }))
  )
  const pending = computed(
    () => supplierCataloguesPending.value || supplierItemsPending.value
  )

  const isIntegratedCatalogue = computed(
    () => catalogueState.value === 'integrated'
  )
  const isPublicOnlySupplier = computed(
    () => catalogueState.value === 'directory_only'
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
    supplierLabel.value
      ? `${supplierLabel.value} Catalogue`
      : 'Supplier Catalogue'
  )

  const catalogueDescription = computed(() => {
    const parts = [
      `state: ${state.value || 'missing'}`,
      `catalogue: ${catalogueState.value || 'missing'}`,
    ]

    return parts.join(' · ')
  })

  const devJsonContext = computed(() => 'workspace supplier · catalogue')
  const debug = computed(() => ({
    supplierId: workspace.id.value,
    supplierName: supplierLabel.value,
    rootCollection: rootCollection.value,
    state: state.value,
    catalogueState: catalogueState.value,
    supplierCataloguesCollectionPath: supplierCataloguesCollectionPath.value,
    supplierItemsCount: supplierItems.value.length,
    catalogueItemsCount: catalogues.value.length,
    pending: pending.value,
  }))

  return {
    selectedSupplier: workspace.data,
    supplierId: workspace.id,
    supplierLabel,
    rootCollection: rootCollection,
    state,
    catalogueState,
    supplierCataloguesCollectionPath,
    catalogues,
    pending,
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

export type SupplierWorkspaceCatalogueState = ReturnType<
  typeof useSupplierWorkspaceCatalogue
>
