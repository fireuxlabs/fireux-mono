import { computed } from 'vue'
import { useSupplierCatalogueCollection } from '../../../../firestore/supplier/fetch/useSupplierCatalogueCollection'
import { useSupplierItemCollection } from '../../../../firestore/supplier/fetch/useSupplierItemCollection'
import { useSupplierConsole } from '../../core/useSupplierConsole'
import {
  findSupplierConsoleDemoScenario,
  useSupplierConsoleDemoData,
} from '../../core/useSupplierConsoleDemoData'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsoleCatalogue() {
  const {
    selection,
    runtime,
  } = useSupplierConsole()

  const supplierLabel = computed(() =>
    normalizeString(selection.supplier.value?.supplier_organization_name)
  )

  const state = computed(() => normalizeString(selection.supplier.value?.state))
  const catalogueState = computed(() =>
    normalizeString(selection.supplier.value?.catalogue_state)
  )
  const supplierCataloguesEnabled = computed(() =>
    runtime.source.value !== 'demo'
    && Boolean(runtime.rootCollection.value && selection.supplierId.value)
  )
  const {
    collectionPath: supplierCataloguesCollectionPath,
    supplierCatalogues,
    pending: supplierCataloguesPending,
  } = useSupplierCatalogueCollection(selection.supplierId, {
    enabled: supplierCataloguesEnabled,
    supplierCollectionPath: runtime.rootCollection,
  })

  const {
    supplierItems: supplierItemsFromStore,
    pending: supplierItemsPending,
  } = useSupplierItemCollection(selection.supplierId, {
    enabled: supplierCataloguesEnabled,
    supplierCollectionPath: runtime.rootCollection,
  })

  const demoData = useSupplierConsoleDemoData(
    computed(() => runtime.source.value === 'demo')
  )
  const demoScenario = computed(() => findSupplierConsoleDemoScenario(
    demoData.data.value,
    selection.supplierId.value
  ))
  const supplierItems = computed(() =>
    runtime.source.value === 'demo'
      ? demoScenario.value?.items ?? []
      : supplierItemsFromStore.value
  )
  const rawCatalogues = computed(() =>
    runtime.source.value === 'demo'
      ? demoScenario.value?.catalogues ?? []
      : supplierCatalogues.value
  )
  const catalogues = computed(() =>
    rawCatalogues.value.map((catalogue) => ({
      ...catalogue,
      supplier_items: supplierItems.value,
    }))
  )
  const pending = computed(() =>
    runtime.source.value === 'demo'
      ? demoData.pending.value
      : supplierCataloguesPending.value || supplierItemsPending.value
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
    supplierId: selection.supplierId.value,
    supplierName: supplierLabel.value,
    rootCollection: runtime.rootCollection.value,
    state: state.value,
    catalogueState: catalogueState.value,
    supplierCataloguesCollectionPath: supplierCataloguesCollectionPath.value,
    supplierItemsCount: supplierItems.value.length,
    catalogueItemsCount: catalogues.value.length,
    pending: pending.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
  }))

  return {
    selectedSupplier: selection.supplier,
    supplierId: selection.supplierId,
    supplierLabel,
    rootCollection: runtime.rootCollection,
    state,
    catalogueState,
    supplierCataloguesCollectionPath,
    catalogues,
    pending,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
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
