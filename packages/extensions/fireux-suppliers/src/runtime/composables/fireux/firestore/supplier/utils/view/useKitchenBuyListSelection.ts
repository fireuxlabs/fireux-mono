import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { SupplierItemRow } from './useSupplierCatalogueForKitchen'

const asString = (value: unknown) => String(value ?? '').trim()

export function useKitchenBuyListSelection(params: {
  filteredRows: MaybeRefOrGetter<SupplierItemRow[]>
}) {
  const filteredRows = computed(() => toValue(params.filteredRows) ?? [])

  const myItemsCollection = computed(() => {
    const grouped = new Map<string, SupplierItemRow[]>()

    for (const row of filteredRows.value) {
      const ingredientId = asString(row.ingredient_id)
      if (!ingredientId) continue
      const list = grouped.get(ingredientId) || []
      list.push(row)
      grouped.set(ingredientId, list)
    }

    const chosen: SupplierItemRow[] = []

    for (const options of grouped.values()) {
      const sorted = [...options].sort((a, b) => {
        return (
          Number(a.cost_per_unit_minor || 0) - Number(b.cost_per_unit_minor || 0) ||
          Number(a.pack_cost_minor || 0) - Number(b.pack_cost_minor || 0)
        )
      })

      const pick = sorted[0]
      if (!pick) continue
      chosen.push(pick)
    }

    return chosen
      .map((entry) => ({
        ...entry,
        source_kind: 'my-item' as const,
        subtitle: `My item · ${entry.supplier_name_full}`,
        supplier_name: entry.supplier_name_full,
        status: '',
      }))
      .sort((a, b) => asString(a.name).localeCompare(asString(b.name)))
  })

  return {
    myItemsCollection,
  }
}
