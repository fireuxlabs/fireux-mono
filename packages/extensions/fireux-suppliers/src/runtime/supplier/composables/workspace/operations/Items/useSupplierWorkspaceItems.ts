import { computed } from 'vue'
import { useSupplierWorkspace } from '../../core/useSupplierWorkspace'
import { useSupplierItemCollection } from '../../../firestore/fetch/useSupplierItemCollection'
import type { SupplierItemSurface } from '../../../item/useSupplierItemInterface'
import {
  findSupplierWorkspaceDemoScenario,
  useSupplierWorkspaceDemoData,
} from '../../core/useSupplierWorkspaceDemoData'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierWorkspaceItems() {
  const { selection, runtime } = useSupplierWorkspace()

  const supplierLabel = computed(() =>
    normalizeString(
      selection.supplier.value?.company_place?.short_name ||
        selection.supplier.value?.company_place?.name
    )
  )

  const linkedIngredientIds = computed(() =>
    supplierItems.value
      .map((item) => normalizeString(item.ingredient_id))
      .filter(Boolean)
  )

  const state = computed(() => normalizeString(selection.supplier.value?.status))
  const catalogueState = computed(() =>
    normalizeString(selection.supplier.value?.catalogue_state)
  )
  const supplierItemsEnabled = computed(
    () =>
      !runtime.isDemo.value &&
      Boolean(runtime.rootCollection.value && selection.supplierId.value)
  )
  const {
    collectionPath: supplierItemsCollectionPath,
    supplierItems: supplierItemsFromStore,
    pending: supplierItemsPending,
  } = useSupplierItemCollection(selection.supplierId, {
    enabled: supplierItemsEnabled,
    supplierCollectionPath: runtime.rootCollection,
  })

  const demoData = useSupplierWorkspaceDemoData(runtime.isDemo)
  const demoScenario = computed(() =>
    findSupplierWorkspaceDemoScenario(
      demoData.data.value,
      selection.supplierId.value
    )
  )
  const supplierItems = computed<SupplierItemSurface[]>(() =>
    runtime.isDemo.value
      ? (demoScenario.value?.items ?? [])
      : supplierItemsFromStore.value
  )
  const pending = computed(() =>
    runtime.isDemo.value ? demoData.pending.value : supplierItemsPending.value
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

  const devJsonContext = computed(() => 'workspace supplier · items')
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

export type SupplierWorkspaceItemsState = ReturnType<
  typeof useSupplierWorkspaceItems
>
