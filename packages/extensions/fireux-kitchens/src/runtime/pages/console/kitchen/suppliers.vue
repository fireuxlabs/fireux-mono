<template>
  <UDashboardPanel id="console-kitchen-suppliers">
    <template #header>
      <LayoutsConsoleNavbar title="Suppliers" />
    </template>

    <template #body>
      <section class="space-y-8">
        <UAlert
          v-if="!kitchenId"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before using suppliers."
          :actions="[
            {
              label: 'Go to kitchens',
              to: '/console/kitchen',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
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
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenBuyListSelection } from 'fireux-suppliers/runtime/composables/fireux/firestore/supplier/utils/view/useKitchenBuyListSelection'
import { useSupplierCatalogueForKitchen } from 'fireux-suppliers/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierCatalogueForKitchen'
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'
import { useIngredientFetch } from '../../../composables/fireux/firestore/ingredient/fetch/useIngredientFetch'
import SupplierCollectionManager from '../../../components/organisms/Supplier/Collection/Manager.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-store',
    order: 11,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const kitchenId = computed(() => String(runtime.id.value || '').trim())
const kitchen = runtime.kitchen

const suppliers = computed(() => runtime.data.value.suppliers ?? [])
const supplierIngredients = computed(() => runtime.data.value.supplierIngredients ?? [])
const kitchenIngredients = computed(() => runtime.data.value.kitchenIngredients ?? [])
const { ingredients: firestoreGlobalIngredients } = useIngredientFetch()
const globalIngredients = computed(() => firestoreGlobalIngredients.value ?? [])

const selectedSupplierId = ref('')
const supplierLayer = ref<'my' | 'all'>('my')
const layer = ref<'my' | 'catalogue'>('my')

const {
  mySuppliers,
  normalizeSupplierId,
  supplierNameById,
  supplierIngredientCollectionAll,
  catalogueCollection,
  filteredBySupplier,
} = useSupplierCatalogueForKitchen({
  suppliers,
  supplierIngredients,
  kitchenIngredients,
  globalIngredients,
  selectedSupplierId,
})

const { myItemsCollection } = useKitchenBuyListSelection({
  filteredRows: filteredBySupplier,
})

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
