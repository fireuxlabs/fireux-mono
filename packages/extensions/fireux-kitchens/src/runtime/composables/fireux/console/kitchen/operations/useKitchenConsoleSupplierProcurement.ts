import { computed } from 'vue'
import { useKitchenConsoleSupplier } from './useKitchenConsoleSupplier'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map(normalizeString).filter(Boolean) : []

export function useKitchenConsoleSupplierProcurement() {
  const supplierState = useKitchenConsoleSupplier()
  const {
    supplier,
    supplierId,
    hasIntegratedCatalogue,
    isEcosystemSupplier,
    cataloguePath,
  } = supplierState

  const supplierName = computed(() =>
    normalizeString(supplier.value?.supplier_organization_name) ||
    normalizeString(supplier.value?.name) ||
    supplierId.value
  )
  const linkedIngredientIds = computed(() =>
    normalizeStringArray(supplier.value?.linked_ingredient_ids)
  )
  const title = computed(() =>
    supplierName.value ? `${supplierName.value} Procurement` : 'Supplier Procurement'
  )
  const description = computed(() =>
    isEcosystemSupplier.value
      ? 'Build a kitchen shopping list from supplier catalogue options.'
      : 'Make a temporary kitchen shopping list for this public supplier reference.'
  )

  return {
    ...supplierState,
    title,
    description,
    linkedIngredientIds,
    hasIntegratedCatalogue,
    cataloguePath,
  }
}
