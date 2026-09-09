import { computed } from 'vue'
import { SupplierStorage } from '../../../../models/Supplier.model'
import { useSupplierWorkspace } from '../../core/useSupplierWorkspace'
import { useSupplierItemCollection } from '../../../useSupplierItemCollection'
import type { SupplierItemSurface } from '../../../item/useSupplierItemInterface'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierWorkspaceItems() {
  const workspace = useSupplierWorkspace()
  const rootCollection = computed(() => SupplierStorage.collection)

  const supplierLabel = computed(() =>
    normalizeString(
      workspace.data.value?.company_place?.short_name ||
        workspace.data.value?.company_place?.name
    )
  )

  const linkedIngredientIds = computed(() =>
    supplierItems.value
      .map((item) => normalizeString(item.ingredient_id))
      .filter(Boolean)
  )

  const state = computed(() => normalizeString(workspace.data.value?.status))
  const catalogueState = computed(() =>
    normalizeString(workspace.data.value?.catalogue_state)
  )
  const supplierItemsEnabled = computed(
    () => Boolean(rootCollection.value && workspace.id.value)
  )
  const {
    collectionPath: supplierItemsCollectionPath,
    supplierItems: supplierItemsFromStore,
    pending: supplierItemsPending,
  } = useSupplierItemCollection(workspace.id, {
    enabled: supplierItemsEnabled,
    supplierCollectionPath: rootCollection,
  })

  const supplierItems = computed<SupplierItemSurface[]>(
    () => supplierItemsFromStore.value
  )
  const pending = supplierItemsPending

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

  const devJsonContext = computed(() => 'workspace supplier · items')
  const debug = computed(() => ({
    supplierId: workspace.id.value,
    supplierName: supplierLabel.value,
    supplierItemsCollectionPath: supplierItemsCollectionPath.value,
    supplierItemsCount: supplierItems.value.length,
    pending: pending.value,
  }))

  return {
    selectedSupplier: workspace.data,
    supplierId: workspace.id,
    supplierLabel,
    linkedIngredientIds,
    state,
    catalogueState,
    supplierItemsCollectionPath,
    supplierItems,
    pending,
    emptyTitle,
    emptyDescription,
    itemsTitle,
    itemsDescription,
    devJsonContext,
    debug,
  }
}

export type SupplierWorkspaceItemsState = ReturnType<
  typeof useSupplierWorkspaceItems
>
