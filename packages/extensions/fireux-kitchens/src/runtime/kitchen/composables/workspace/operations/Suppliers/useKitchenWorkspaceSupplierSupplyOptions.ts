import { computed } from 'vue'
import { useKitchenWorkspaceSupplier } from './useKitchenWorkspaceSupplier'

const normalizeString = (value: unknown) => String(value ?? '').trim()
export function useKitchenWorkspaceSupplierSupplyOptions() {
  const supplierState = useKitchenWorkspaceSupplier()
  const {
    supplier,
    supplierId,
    hasIntegratedCatalogue,
    isEcosystemSupplier,
    cataloguePath,
    supplierSupplyLines,
  } = supplierState

  const supplierName = computed(
    () =>
      normalizeString((supplier.value?.company_place as any)?.short_name) ||
      normalizeString((supplier.value?.company_place as any)?.name) ||
      normalizeString(supplier.value?.name) ||
      supplierId.value
  )
  const linkedIngredientIds = computed(() =>
    supplierSupplyLines.value.map((line) => line.ingredient.id)
  )
  const supplyOptionLines = computed(() =>
    supplierSupplyLines.value.map((line) => {
      const item = line.supplierItem
      const packCostMinor = Number(item.pack_cost_minor)
      const currencyCode =
        normalizeString(item.currency_code).toUpperCase() || 'CHF'
      const packPrice =
        Number.isFinite(packCostMinor) && packCostMinor > 0
          ? new Intl.NumberFormat('de-CH', {
              style: 'currency',
              currency: currencyCode,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(packCostMinor / 100)
          : ''

      return {
        id: line.link.id,
        ingredientId: line.ingredient.id,
        ingredientName: line.ingredient.name,
        supplierItemId: item.id,
        packLabel: normalizeString(item.pack_size_label),
        packPrice,
      }
    })
  )
  const title = computed(() =>
    supplierName.value
      ? `${supplierName.value} Supply Options`
      : 'Supplier Supply Options'
  )
  const description = computed(() =>
    isEcosystemSupplier.value
      ? 'Review the supplier catalogue options connected to this kitchen.'
      : 'Review the ingredients associated with this supplier reference.'
  )

  return {
    ...supplierState,
    title,
    description,
    linkedIngredientIds,
    supplyOptionLines,
    hasIntegratedCatalogue,
    cataloguePath,
  }
}
