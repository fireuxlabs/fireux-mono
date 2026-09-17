import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import { useKitchenWorkspaceSuppliers } from './useKitchenWorkspaceSuppliers'

const normalizeString = (value: unknown) => String(value ?? '').trim()
type KitchenSupplierSurface = Record<string, unknown> & {
  id?: string | null
}

export function useKitchenWorkspaceSupplier() {
  const {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    readOnly,
    canWrite,
    suppliers,
    pending,
  } = useKitchenWorkspaceSuppliers()

  const supplierId = useRouteParam('supplierId')

  const supplier = computed<KitchenSupplierSurface | null>(
    () =>
      (suppliers.value.find(
        (item) => normalizeString(item?.id) === supplierId.value
      ) as KitchenSupplierSurface | undefined) ?? null
  )
  const supplierState = computed(() => normalizeString(supplier.value?.status))
  const catalogueState = computed(() =>
    normalizeString(supplier.value?.catalogue_state)
  )
  const hasIntegratedCatalogue = computed(
    () => catalogueState.value === 'integrated'
  )
  const isEcosystemSupplier = computed(
    () => supplierState.value === 'active' || hasIntegratedCatalogue.value
  )
  const supplierBasePath = computed(() =>
    supplierId.value
      ? `/workspace/kitchen/stock/suppliers/${encodeURIComponent(supplierId.value)}`
      : ''
  )
  const cataloguePath = computed(() =>
    supplierBasePath.value ? `${supplierBasePath.value}/catalogue` : ''
  )
  const supplyOptionsPath = computed(() =>
    supplierBasePath.value ? `${supplierBasePath.value}/supply-options` : ''
  )

  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: collectionPath.value,
    supplierId: supplierId.value,
    hasSupplier: Boolean(supplier.value),
    supplierState: supplierState.value,
    catalogueState: catalogueState.value,
    hasIntegratedCatalogue: hasIntegratedCatalogue.value,
    isEcosystemSupplier: isEcosystemSupplier.value,
    pending: pending.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    readOnly,
    canWrite,
    suppliers,
    pending,
    supplierId,
    supplier,
    supplierState,
    catalogueState,
    hasIntegratedCatalogue,
    isEcosystemSupplier,
    supplierBasePath,
    cataloguePath,
    supplyOptionsPath,
    debug,
  }
}
