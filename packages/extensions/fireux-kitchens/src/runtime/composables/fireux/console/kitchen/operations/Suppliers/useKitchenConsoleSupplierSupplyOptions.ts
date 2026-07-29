import { computed } from 'vue'
import { useKitchenConsoleSupplier } from './useKitchenConsoleSupplier'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map(normalizeString).filter(Boolean) : []

export function useKitchenConsoleSupplierSupplyOptions() {
  const supplierState = useKitchenConsoleSupplier()
  const {
    supplier,
    supplierId,
    supplierScenario,
    hasIntegratedCatalogue,
    isEcosystemSupplier,
    cataloguePath,
    supplierSupplyLines,
  } = supplierState

  const supplierName = computed(() =>
    normalizeString(supplier.value?.supplier_organization_name) ||
    normalizeString(supplier.value?.name) ||
    supplierId.value
  )
  const linkedIngredientIds = computed(() =>
    supplierScenario.value
      ? supplierSupplyLines.value.map(line => line.ingredient.id)
      : normalizeStringArray(supplier.value?.linked_ingredient_ids)
  )
  const supplyOptionLines = computed(() =>
    supplierSupplyLines.value.map((line) => {
      const item = line.supplierItem
      const packCostMinor = Number(item.pack_cost_minor)
      const currencyCode =
        normalizeString(item.currency_code).toUpperCase() || 'CHF'
      const packPrice = Number.isFinite(packCostMinor) && packCostMinor > 0
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
    supplierName.value ? `${supplierName.value} Supply Options` : 'Supplier Supply Options'
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
