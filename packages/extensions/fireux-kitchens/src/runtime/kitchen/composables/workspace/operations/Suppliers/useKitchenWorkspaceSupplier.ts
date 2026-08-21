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
    supplierScenarios,
    supplyLines,
    pending,
  } = useKitchenWorkspaceSuppliers()

  const supplierId = useRouteParam('supplierId')

  const supplier = computed<KitchenSupplierSurface | null>(
    () =>
      (suppliers.value.find(
        (item) => normalizeString(item?.id) === supplierId.value
      ) as KitchenSupplierSurface | undefined) ?? null
  )
  const supplierScenario = computed(
    () =>
      supplierScenarios.value.find(
        (scenario) => normalizeString(scenario.supplier.id) === supplierId.value
      ) ?? null
  )
  const supplierSupplyLines = computed(() =>
    supplyLines.value.filter(
      (line) => normalizeString(line.link.supplier_id) === supplierId.value
    )
  )
  const supplierState = computed(() => normalizeString(supplier.value?.state))
  const catalogueState = computed(() =>
    normalizeString(supplier.value?.catalogue_state)
  )
  const hasIntegratedCatalogue = computed(
    () => catalogueState.value === 'integrated'
  )
  const isEcosystemSupplier = computed(
    () => supplierState.value === 'official' || hasIntegratedCatalogue.value
  )
  const supplierBasePath = computed(() =>
    supplierId.value
      ? `/workspace/kitchen/suppliers/${encodeURIComponent(supplierId.value)}`
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
    kitchenIngredientCount: supplierSupplyLines.value.length,
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
    supplierScenario,
    supplierSupplyLines,
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
