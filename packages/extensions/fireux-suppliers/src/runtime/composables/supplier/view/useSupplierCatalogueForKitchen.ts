import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export type SupplierItemRow = {
  id: string
  supplier_id: string
  ingredient_id: string
  name: string
  slug: string
  image_url: string
  subtitle: string
  pack_label: string
  supplier_name_full: string
  supplier_name_compact: string
  supplier_name: string
  status: string
  source_kind: 'catalogue' | 'my-item'
  cost_per_unit_minor: number
  pack_cost_minor: number
  currency_code: string
  unit: string
}

const asRecord = (value: unknown) => (value as Record<string, unknown>) ?? {}
const asString = (value: unknown) => String(value ?? '').trim()

function buildGlobalIngredientImageResolver(globalIngredients: unknown[]) {
  const imageById = new Map<string, string>()
  for (const ingredient of globalIngredients) {
    const row = asRecord(ingredient)
    const ingredientId = asString(row.id)
    if (!ingredientId) continue
    imageById.set(ingredientId, asString(row.image_url))
  }

  return (ingredientIdRaw: unknown) => {
    const ingredientId = asString(ingredientIdRaw)
    if (!ingredientId) return ''

    const direct = imageById.get(ingredientId) || ''
    if (direct) return direct

    if (ingredientId.startsWith('ingredient-')) {
      const stripped = asString(ingredientId.slice('ingredient-'.length))
      if (!stripped) return ''
      return imageById.get(stripped) || ''
    }

    return imageById.get(`ingredient-${ingredientId}`) || ''
  }
}

export function useSupplierCatalogueForKitchen(params: {
  suppliers: MaybeRefOrGetter<unknown[]>
  supplierIngredients: MaybeRefOrGetter<unknown[]>
  kitchenIngredients: MaybeRefOrGetter<unknown[]>
  globalIngredients: MaybeRefOrGetter<unknown[]>
  selectedSupplierId: MaybeRefOrGetter<string>
}) {
  const suppliers = computed(() => toValue(params.suppliers) ?? [])
  const supplierIngredients = computed(() => toValue(params.supplierIngredients) ?? [])
  const kitchenIngredients = computed(() => toValue(params.kitchenIngredients) ?? [])
  const globalIngredients = computed(() => toValue(params.globalIngredients) ?? [])
  const selectedSupplierId = computed(() => asString(toValue(params.selectedSupplierId)))

  const normalizeSupplierId = (row: unknown) => asString(asRecord(row).id)

  const mySupplierIdSet = computed(() => {
    const set = new Set<string>()
    for (const row of supplierIngredients.value) {
      const supplierId = asString(asRecord(row).supplier_id)
      if (!supplierId) continue
      set.add(supplierId)
    }
    return set
  })

  const mySuppliers = computed(() =>
    suppliers.value.filter((row) => mySupplierIdSet.value.has(normalizeSupplierId(row)))
  )

  const supplierNameById = computed(() => {
    const map = new Map<string, string>()
    for (const supplier of suppliers.value) {
      const row = asRecord(supplier)
      const id = asString(row.id)
      if (!id) continue
      const name = asString(row.name) || asString(row.short_name)
      if (!name) continue
      map.set(id, name)
    }
    return map
  })

  const ingredientNameById = computed(() => {
    const map = new Map<string, string>()
    for (const ingredient of kitchenIngredients.value) {
      const row = asRecord(ingredient)
      const ingredientId = asString(row.ingredient_id) || asString(row.id)
      if (!ingredientId) continue
      const name = asString(row.name)
      if (!name) continue
      map.set(ingredientId, name)
    }
    return map
  })

  const resolveGlobalIngredientImage = computed(() =>
    buildGlobalIngredientImageResolver(globalIngredients.value)
  )

  const supplierIngredientCollectionAll = computed<SupplierItemRow[]>(() =>
    supplierIngredients.value
      .map((entry, index) => {
        const row = asRecord(entry)

        const id = asString(row.id) || `supplier-ingredient-${index + 1}`
        const supplierId = asString(row.supplier_id)
        const ingredientId = asString(row.ingredient_id)
        const supplierName = asString(supplierNameById.value.get(supplierId))
        const ingredientName = asString(ingredientNameById.value.get(ingredientId))
        const supplierNameStrict = supplierName || `[Missing supplier name: ${supplierId || 'unknown'}]`
        const ingredientNameStrict = ingredientName || `[Missing ingredient name: ${ingredientId || 'unknown'}]`

        const unit = asString(row.unit) || 'unit'
        const packSizeLabel = asString(row.pack_size_label) || 'Pack'
        const currencyCode = asString(row.currency_code || 'CHF') || 'CHF'

        const packCostMinor = Number(row.pack_cost_minor || 0)
        const unitCostMinor = Number(row.cost_per_unit_minor || 0)

        const supplierIngredientImage = asString(row.image_url) || asString(row.ingredient_image_url)
        const globalImage = resolveGlobalIngredientImage.value(ingredientId)

        return {
          id,
          supplier_id: supplierId,
          ingredient_id: ingredientId,
          name: ingredientNameStrict,
          slug: ingredientId || id,
          image_url: supplierIngredientImage || globalImage,
          subtitle: supplierNameStrict,
          pack_label: packSizeLabel || '[Missing pack size]',
          supplier_name_full: supplierNameStrict,
          supplier_name_compact: supplierNameStrict,
          supplier_name: supplierNameStrict,
          status: '',
          source_kind: 'catalogue',
          cost_per_unit_minor: unitCostMinor,
          pack_cost_minor: packCostMinor,
          currency_code: currencyCode,
          unit,
        }
      })
      .sort((a, b) =>
        String(a.supplier_name_full || '').localeCompare(String(b.supplier_name_full || '')) ||
        String(a.name || '').localeCompare(String(b.name || ''))
      )
  )

  const filteredBySupplier = computed(() => {
    if (!selectedSupplierId.value) return supplierIngredientCollectionAll.value
    return supplierIngredientCollectionAll.value.filter(
      (entry) => asString(entry.supplier_id) === selectedSupplierId.value
    )
  })

  const catalogueCollection = computed(() => {
    const optionCountByIngredient = new Map<string, number>()
    for (const row of filteredBySupplier.value) {
      const ingredientId = asString(row.ingredient_id)
      if (!ingredientId) continue
      optionCountByIngredient.set(ingredientId, (optionCountByIngredient.get(ingredientId) || 0) + 1)
    }

    return filteredBySupplier.value.map((entry) => {
      const optionCount = optionCountByIngredient.get(asString(entry.ingredient_id)) || 1
      return {
        ...entry,
        source_kind: 'catalogue' as const,
        subtitle: `Catalogue · ${entry.supplier_name_full}`,
        supplier_name: entry.supplier_name_full,
        status: `${optionCount} ${optionCount === 1 ? 'price' : 'prices'}`,
      }
    })
  })

  return {
    suppliers,
    mySuppliers,
    normalizeSupplierId,
    mySupplierIdSet,
    supplierNameById,
    supplierIngredientCollectionAll,
    catalogueCollection,
    filteredBySupplier,
  }
}
