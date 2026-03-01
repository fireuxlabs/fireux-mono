<template>
  <UDashboardPanel id="console-kitchen-suppliers">
    <template #header>
      <LayoutsConsoleNavbar title="Suppliers" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span> · Suppliers:
          <span class="font-medium">{{ supplierCollection.length }}</span>
          <span class="text-dimmed"> / {{ suppliers.length }}</span>
          <span class="mx-2">·</span>
          Catalogue Rows: <span class="font-medium">{{ supplierIngredientCollectionAll.length }}</span>
          <span class="mx-2">·</span>
          Buy Lists: <span class="font-medium">{{ myItemsCollection.length }}</span>
        </div>

        <SupplierCollectionManager
          :collection="supplierCollection"
          :title="supplierCollectionTitle"
          :description="supplierCollectionDescription"
          :link="false"
          :selected-id="selectedSupplierId"
          @select="onSelectSupplier"
        >
          <template #controls>
            <UButton
              size="xs"
              :variant="supplierLayer === 'my' ? 'solid' : 'soft'"
              icon="i-lucide-user-check"
              @click="supplierLayer = 'my'"
            >
              My Suppliers
            </UButton>
            <UButton
              size="xs"
              :variant="supplierLayer === 'all' ? 'solid' : 'soft'"
              icon="i-lucide-users"
              @click="supplierLayer = 'all'"
            >
              All Suppliers
            </UButton>
          </template>
        </SupplierCollectionManager>

        <IngredientCollectionManager
          :collection="supplierItemsCollection"
          :link="false"
          :title="supplierItemsTitle"
          :description="supplierItemsDescription"
          :dev-json-title="supplierItemsDevJsonTitle"
          :dev-json-context="supplierItemsDevJsonContext"
          :dev-json-data="supplierItemsCollection"
        >
          <template #controls>
            <UButton
              size="xs"
              :variant="layer === 'my' ? 'solid' : 'soft'"
              icon="i-lucide-check-circle"
              @click="layer = 'my'"
            >
              Buy Lists
            </UButton>
            <UButton
              size="xs"
              :variant="layer === 'catalogue' ? 'solid' : 'soft'"
              icon="i-lucide-list"
              @click="layer = 'catalogue'"
            >
              Catalogue
            </UButton>
          </template>
        </IngredientCollectionManager>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'
import { useIngredientFetch } from '../../../composables/fireux/firestore/ingredient/fetch/useIngredientFetch'
import SupplierCollectionManager from '../../../components/organisms/Supplier/Collection/Manager.vue'

definePageMeta({
  layout: 'kitchen-console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-store',
    order: 11,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const kitchen = runtime.kitchen

const suppliers = computed(() => runtime.data.value.suppliers ?? [])
const supplierIngredients = computed(() => runtime.data.value.supplierIngredients ?? [])
const kitchenIngredients = computed(() => runtime.data.value.kitchenIngredients ?? [])
const { ingredients: firestoreGlobalIngredients } = useIngredientFetch()

const selectedSupplierId = ref('')
const supplierLayer = ref<'my' | 'all'>('my')
const layer = ref<'my' | 'catalogue'>('my')

const normalizeSupplierId = (row: unknown) =>
  String((row as Record<string, unknown>)?.id || '').trim()

const mySupplierIdSet = computed(() => {
  const set = new Set<string>()
  for (const row of supplierIngredients.value) {
    const supplierId = String((row as Record<string, unknown>)?.supplier_id || '').trim()
    if (!supplierId) continue
    set.add(supplierId)
  }
  return set
})

const mySuppliers = computed(() =>
  suppliers.value.filter((row) => mySupplierIdSet.value.has(normalizeSupplierId(row)))
)

const supplierCollection = computed(() =>
  supplierLayer.value === 'my' ? mySuppliers.value : suppliers.value
)

const supplierCollectionTitle = computed(() =>
  supplierLayer.value === 'my' ? 'My Suppliers' : 'All Suppliers'
)

const supplierCollectionDescription = computed(() =>
  supplierLayer.value === 'my'
    ? 'Suppliers currently used in your buy lists.'
    : 'All suppliers available to this kitchen context.'
)

const supplierNameById = computed(() => {
  const map = new Map<string, string>()
  for (const supplier of suppliers.value) {
    const row = supplier as Record<string, unknown>
    const id = String(row.id || '').trim()
    if (!id) continue
    const name = String(row.name || row.short_name || '').trim()
    if (!name) continue
    map.set(id, name)
  }
  return map
})

const ingredientNameById = computed(() => {
  const map = new Map<string, string>()
  for (const ingredient of kitchenIngredients.value) {
    const row = ingredient as Record<string, unknown>
    const ingredientId = String(row.ingredient_id || row.id || '').trim()
    if (!ingredientId) continue
    const name = String(row.name || '').trim()
    if (!name) continue
    map.set(ingredientId, name)
  }
  return map
})

const globalIngredients = computed(() => firestoreGlobalIngredients.value ?? [])

const globalIngredientImageById = computed(() => {
  const map = new Map<string, string>()
  for (const ingredient of globalIngredients.value) {
    const row = ingredient as Record<string, unknown>
    const ingredientId = String(row.id || '').trim()
    if (!ingredientId) continue
    map.set(ingredientId, String(row.image_url || '').trim())
  }
  return map
})

const resolveGlobalIngredientImage = (ingredientIdRaw: unknown) => {
  const ingredientId = String(ingredientIdRaw || '').trim()
  if (!ingredientId) return ''

  const direct = globalIngredientImageById.value.get(ingredientId) || ''
  if (direct) return direct

  if (ingredientId.startsWith('ingredient-')) {
    const stripped = String(ingredientId.slice('ingredient-'.length) || '').trim()
    if (!stripped) return ''
    return globalIngredientImageById.value.get(stripped) || ''
  }

  return globalIngredientImageById.value.get(`ingredient-${ingredientId}`) || ''
}

type SupplierItemRow = {
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

const supplierIngredientCollectionAll = computed<SupplierItemRow[]>(() =>
  supplierIngredients.value
    .map((entry, index) => {
      const row = entry as Record<string, unknown>

      const id = String(row.id || '').trim() || `supplier-ingredient-${index + 1}`
      const supplierId = String(row.supplier_id || '').trim()
      const ingredientId = String(row.ingredient_id || '').trim()
      const supplierName = String(supplierNameById.value.get(supplierId) || '').trim()
      const ingredientName = String(ingredientNameById.value.get(ingredientId) || '').trim()
      const supplierNameStrict = supplierName || `[Missing supplier name: ${supplierId || 'unknown'}]`
      const ingredientNameStrict = ingredientName || `[Missing ingredient name: ${ingredientId || 'unknown'}]`

      const unit = String(row.unit || '').trim() || 'unit'
      const packSizeLabel = String(row.pack_size_label || '').trim() || 'Pack'
      const currencyCode = String(row.currency_code || 'CHF').trim() || 'CHF'

      const packCostMinor = Number(row.pack_cost_minor || 0)
      const unitCostMinor = Number(row.cost_per_unit_minor || 0)

      const supplierIngredientImage = String(row.image_url || row.ingredient_image_url || '').trim()
      const globalImage = resolveGlobalIngredientImage(ingredientId)
      const packLabelStrict = packSizeLabel || '[Missing pack size]'
      const supplierNameCompact = supplierNameStrict
      const supplierNameFull = supplierNameStrict

      return {
        id,
        supplier_id: supplierId,
        ingredient_id: ingredientId,
        name: ingredientNameStrict,
        slug: ingredientId || id,
        image_url: supplierIngredientImage || globalImage,
        subtitle: supplierNameStrict,
        pack_label: packLabelStrict,
        supplier_name_full: supplierNameFull,
        supplier_name_compact: supplierNameCompact,
        supplier_name: supplierNameFull,
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

const catalogueCollection = computed(() => {
  const filtered = !selectedSupplierId.value
    ? supplierIngredientCollectionAll.value
    : supplierIngredientCollectionAll.value.filter((entry) => {
      const supplierId = String(entry.supplier_id || '').trim()
      return supplierId === selectedSupplierId.value
    })

  const optionCountByIngredient = new Map<string, number>()
  for (const row of filtered) {
    const ingredientId = String(row.ingredient_id || '').trim()
    if (!ingredientId) continue
    optionCountByIngredient.set(ingredientId, (optionCountByIngredient.get(ingredientId) || 0) + 1)
  }

  return filtered.map((entry) => {
    const optionCount = optionCountByIngredient.get(String(entry.ingredient_id || '').trim()) || 1

    return {
      ...entry,
      source_kind: 'catalogue',
      subtitle: `Catalogue · ${entry.supplier_name_full}`,
      supplier_name: entry.supplier_name_full,
      status: `${optionCount} ${optionCount === 1 ? 'price' : 'prices'}`,
    }
  })
})

/**
 * My Items = 1 chosen option per ingredient.
 * For now: choose cheapest cost_per_unit_minor for each ingredient.
 */
const myItemsCollection = computed(() => {
  const sourceRows = !selectedSupplierId.value
    ? supplierIngredientCollectionAll.value
    : supplierIngredientCollectionAll.value.filter((entry) => {
      const supplierId = String(entry.supplier_id || '').trim()
      return supplierId === selectedSupplierId.value
    })

  const grouped = new Map<string, SupplierItemRow[]>()

  for (const row of sourceRows) {
    const ingredientId = String(row.ingredient_id || '').trim()
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
      source_kind: 'my-item',
      subtitle: `My item · ${entry.supplier_name_full}`,
      supplier_name: entry.supplier_name_full,
      status: '',
    }))
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
})

const supplierItemsCollection = computed(() =>
  layer.value === 'my' ? myItemsCollection.value : catalogueCollection.value
)

watch(
  supplierCollection,
  (rows) => {
    const selected = String(selectedSupplierId.value || '').trim()
    if (!selected) return
    const stillVisible = rows.some((row) => normalizeSupplierId(row) === selected)
    if (!stillVisible) selectedSupplierId.value = ''
  },
  { immediate: true }
)

const onSelectSupplier = (supplierId: string) => {
  selectedSupplierId.value = String(supplierId || '').trim()
}

const selectedSupplierName = computed(() => {
  const supplierId = String(selectedSupplierId.value || '').trim()
  if (!supplierId) return ''
  const supplierName = String(supplierNameById.value.get(supplierId) || '').trim()
  return supplierName || `[Missing supplier name: ${supplierId}]`
})

const kitchenName = computed(() => {
  const name = String((kitchen.value as Record<string, unknown> | null)?.name || '').trim()
  return name || '[Missing kitchen name]'
})

const myItemsTitle = computed(() => {
  if (!selectedSupplierId.value) return `${kitchenName.value} buy lists`
  return `${kitchenName.value} buy lists · ${selectedSupplierName.value}`
})

const catalogueTitle = computed(() => {
  if (!selectedSupplierId.value) return 'Catalogue'
  return `Catalogue · ${selectedSupplierName.value}`
})

const supplierItemsTitle = computed(() =>
  layer.value === 'my' ? myItemsTitle.value : catalogueTitle.value
)

const supplierItemsDescription = computed(() =>
  layer.value === 'my'
    ? 'Kitchen-selected buy list.'
    : 'All supplier catalogue lines (can include multiple options per ingredient).'
)

const supplierItemsDevJsonTitle = computed(() =>
  `${supplierItemsTitle.value} (JSON)`
)

const supplierItemsDevJsonContext = computed(() =>
  layer.value === 'my'
    ? `console kitchen suppliers · ${myItemsTitle.value}`
    : `console kitchen suppliers · ${catalogueTitle.value}`
)
</script>
