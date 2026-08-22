import { computed } from 'vue'
import { useKitchenWorkspaceSupplier } from './useKitchenWorkspaceSupplier'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeArray = <T>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : []

export function useKitchenWorkspaceSupplierCatalogue() {
  const supplierState = useKitchenWorkspaceSupplier()
  const {
    supplierId,
    supplier,
    supplierScenario,
    hasIntegratedCatalogue,
    supplyOptionsPath,
  } = supplierState

  const catalogues = computed(() =>
    hasIntegratedCatalogue.value
      ? supplierScenario.value
        ? supplierScenario.value.catalogues.map((catalogue) => ({
            ...catalogue,
            supplier_items: supplierScenario.value?.items ?? [],
          }))
        : normalizeArray(supplier.value?.catalogue)
      : []
  )
  const pending = computed(() => false)
  const supplierName = computed(
    () =>
      normalizeString((supplier.value?.company_place as any)?.short_name) ||
      normalizeString((supplier.value?.company_place as any)?.name) ||
      normalizeString(supplier.value?.name) ||
      supplierId.value
  )
  const title = computed(() =>
    supplierName.value
      ? `${supplierName.value} Catalogue`
      : 'Supplier Catalogue'
  )
  const description = computed(() =>
    hasIntegratedCatalogue.value
      ? 'Supplier-owned product options available to this kitchen.'
      : 'This supplier is not in the ecosystem and does not have a supplier catalogue.'
  )

  return {
    ...supplierState,
    catalogues,
    pending,
    title,
    description,
    supplyOptionsPath,
  }
}
