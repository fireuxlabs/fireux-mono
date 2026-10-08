import { computed } from 'vue'
import { SupplierStorage } from '../../../models/Supplier.model'
import { useSupplierWorkspace } from '../useSupplierWorkspace'
import { useSupplierDetail } from '../../useSupplierDetail'
import { useSupplierItemCollection } from '../../useSupplierItemCollection'
import type { SupplierItemSurface } from '../../item/useSupplierItemInterface'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierWorkspaceItems() {
  const workspace = useSupplierWorkspace()
  const identity = useSupplierDetail(workspace.id)
  const rootCollection = computed(() => SupplierStorage.collection)

  const supplierLabel = computed(() =>
    normalizeString(
      identity.place.value?.short_name || identity.place.value?.name
    )
  )

  const linkedIngredientIds = computed(() =>
    supplierItems.value
      .map((item) => normalizeString(item.ingredient_id))
      .filter(Boolean)
  )

  const state = computed(() =>
    normalizeString(workspace.data.value?.identity?.status)
  )
  const catalogueState = computed(() =>
    normalizeString(workspace.data.value?.catalogue?.mode)
  )
  const supplierItemsEnabled = computed(
    () =>
      workspace.outcome.value === 'ready' &&
      Boolean(rootCollection.value && workspace.id.value)
  )
  const {
    collectionPath: supplierItemsCollectionPath,
    supplierItems: supplierItemsFromStore,
    pending: supplierItemsPending,
    error: readError,
    outcome: sourceOutcome,
  } = useSupplierItemCollection(workspace.id, {
    enabled: supplierItemsEnabled,
    supplierCollectionPath: rootCollection,
  })

  const outcome = computed(() =>
    workspace.outcome.value !== 'ready'
      ? workspace.outcome.value
      : sourceOutcome.value
  )
  const supplierItems = computed<SupplierItemSurface[]>(() =>
    outcome.value === 'ready' ? supplierItemsFromStore.value : []
  )
  const pending = supplierItemsPending

  const emptyTitle = computed(() => 'No supplier items yet')

  const emptyDescription = computed(() => {
    return 'No supplier-owned item rows are available for this supplier yet.'
  })

  const itemsTitle = computed(() =>
    supplierLabel.value ? `${supplierLabel.value} Items` : 'Items'
  )

  const itemsDescription = computed(() =>
    ['ready', 'empty'].includes(outcome.value)
      ? `${linkedIngredientIds.value.length} linked ingredients`
      : ''
  )

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
    outcome,
    readError,
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
