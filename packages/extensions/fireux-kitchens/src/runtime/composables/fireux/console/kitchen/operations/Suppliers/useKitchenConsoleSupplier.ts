import { useRoute } from '#imports'
import { computed } from 'vue'
import { useKitchenConsoleSuppliers } from './useKitchenConsoleSuppliers'

const normalizeString = (value: unknown) => String(value ?? '').trim()
type KitchenSupplierSurface = Record<string, unknown> & {
  id?: string | null
}

export function useKitchenConsoleSupplier() {
  const route = useRoute()
  const {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    readOnly,
    canWrite,
    suppliers,
    pending,
  } = useKitchenConsoleSuppliers()

  const supplierId = computed(() => {
    const raw = route.params.supplierId
    return normalizeString(Array.isArray(raw) ? raw[0] : raw)
  })

  const supplier = computed<KitchenSupplierSurface | null>(
    () =>
      (suppliers.value.find((item) => normalizeString(item?.id) === supplierId.value) as
        | KitchenSupplierSurface
        | undefined) ??
      null
  )
  const supplierState = computed(() => normalizeString(supplier.value?.state))
  const catalogueState = computed(() =>
    normalizeString(supplier.value?.catalogue_state)
  )
  const hasIntegratedCatalogue = computed(() =>
    catalogueState.value === 'integrated'
  )
  const isEcosystemSupplier = computed(() =>
    supplierState.value === 'official' || hasIntegratedCatalogue.value
  )
  const supplierBasePath = computed(() =>
    supplierId.value
      ? `/console/kitchen/suppliers/${encodeURIComponent(supplierId.value)}`
      : ''
  )
  const cataloguePath = computed(() =>
    supplierBasePath.value ? `${supplierBasePath.value}/catalogue` : ''
  )
  const procurementPath = computed(() =>
    supplierBasePath.value ? `${supplierBasePath.value}/procurement` : ''
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
    procurementPath,
    debug,
  }
}
