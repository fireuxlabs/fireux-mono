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
  const procurementLines = computed(() =>
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
    procurementLines,
    hasIntegratedCatalogue,
    cataloguePath,
  }
}
