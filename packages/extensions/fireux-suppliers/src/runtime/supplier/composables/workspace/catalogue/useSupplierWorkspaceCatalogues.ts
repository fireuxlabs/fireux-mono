import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { computed } from 'vue'
import { SupplierStorage } from '../../../models/Supplier.model'
import { useSupplierCatalogueCollection } from '../../useSupplierCatalogueCollection'
import { useSupplierItemCollection } from '../../useSupplierItemCollection'
import { useSupplierWorkspace } from '../useSupplierWorkspace'
import { useSupplierDetail } from '../../useSupplierDetail'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierWorkspaceCatalogues() {
  const workspace = useSupplierWorkspace()
  const identity = useSupplierDetail(workspace.id)
  const rootCollection = computed(() => SupplierStorage.collection)

  const supplierLabel = computed(() =>
    normalizeString(
      identity.place.value?.short_name || identity.place.value?.name
    )
  )

  const state = computed(() =>
    normalizeString(workspace.data.value?.identity?.status)
  )
  const catalogueState = computed(() =>
    normalizeString(workspace.data.value?.catalogue?.mode)
  )
  const supplierCataloguesEnabled = computed(
    () =>
      workspace.outcome.value === 'ready' &&
      Boolean(rootCollection.value && workspace.id.value)
  )
  const {
    collectionPath: supplierCataloguesCollectionPath,
    supplierCatalogues,
    pending: supplierCataloguesPending,
    error: catalogueError,
    outcome: catalogueOutcome,
  } = useSupplierCatalogueCollection(workspace.id, {
    enabled: supplierCataloguesEnabled,
    supplierCollectionPath: rootCollection,
  })

  const {
    supplierItems: supplierItemsFromStore,
    pending: supplierItemsPending,
    error: itemsError,
    outcome: itemsOutcome,
  } = useSupplierItemCollection(workspace.id, {
    enabled: supplierCataloguesEnabled,
    supplierCollectionPath: rootCollection,
  })

  const readError = computed(() => catalogueError.value || itemsError.value)
  const outcome = computed(() =>
    workspace.outcome.value !== 'ready'
      ? workspace.outcome.value
      : resolveReadOutcome({
          active: supplierCataloguesEnabled.value,
          pending:
            catalogueOutcome.value === 'pending' ||
            itemsOutcome.value === 'pending',
          error: readError.value,
          kind: 'collection',
          present: supplierCatalogues.value.length > 0,
        })
  )
  const supplierItems = computed(() =>
    outcome.value === 'ready' ? supplierItemsFromStore.value : []
  )
  const rawCatalogues = computed(() =>
    outcome.value === 'ready' ? supplierCatalogues.value : []
  )
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

  const catalogueDescription = computed(() =>
    ['ready', 'empty'].includes(outcome.value)
      ? `${catalogues.value.length} catalogue${catalogues.value.length === 1 ? '' : 's'}`
      : ''
  )

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
    outcome,
    readError,
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

export type SupplierWorkspaceCataloguesState = ReturnType<
  typeof useSupplierWorkspaceCatalogues
>
