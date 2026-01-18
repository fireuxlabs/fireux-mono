<template>
  <UPage>
    <UPageHeader
      title="Dev · Products (Ext)"
      description="Model shape for Products collection."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Products · Model'"
          :model="productModelRuntime"
        />
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Products collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse products resolved for this runtime and filter by model drift.
              </p>
              <DevDriftToolbar
                :drift-kind="productsDriftKind"
                :selected-field="productsSelectedField"
                :filter-options="productsFilterOptions"
                :copy-label="copying ? 'Copying…' : 'Copy drift · Products'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setProductsDriftKind"
                @update:selected-field="updateProductsSelectedField"
                @copy="copyProductsDrift"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Products (JSON)'"
            :data="allProductsJsonPayload"
            :default-open="false"
          />
        </template>

        <ProductCollectionManager :cards="cards" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useProductCollection } from '../../composables/fireux/firestore/objects/product/fetch/useProductCollection'
import { useProductInterface } from '../../composables/fireux/firestore/objects/product/utils/view/useProductInterface'
import { ProductRuntime as ProductModelRuntime } from '../../models/objects/product.model'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-products',
    label: 'Products (Ext)',
    icon: 'i-lucide-package',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const productModelRuntime = ProductModelRuntime

const { products } = useProductCollection()
const { card: makeCard } = useProductInterface()

const productsCollection = computed(() => products.value ?? [])

const {
  driftKind: productsDriftKind,
  setDriftKind: setProductsDriftKind,
  selectedField: productsSelectedField,
  driftById: productsDriftById,
  filterOptions: productsFilterOptions,
  filteredCollection: filteredProducts,
} = useDevDriftFilter({
  collection: productsCollection,
  runtimeModel: productModelRuntime,
})

const cards = computed(() =>
  filteredProducts.value
    .map((product) => makeCard(product))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const allProductsJsonPayload = computed(() => ({
  totalProducts: productsCollection.value.length,
  products: productsCollection.value,
}))

const filteredProductsDriftPayload = computed(() =>
  cards.value.map((card) => {
    const drift = productsDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      name: card.name,
      drift,
    }
  })
)

const { copyJSON, copying } = useDevClipboard()

const copyProductsDrift = async () => {
  await copyJSON(
    {
      modelPath: 'packages/extensions/fireux-products/src/runtime/models/objects/product.model.ts',
      driftKind: productsDriftKind.value,
      selectedField: productsSelectedField.value || null,
      totalProducts: cards.value.length,
      products: filteredProductsDriftPayload.value,
    },
    { label: 'Dev · Products · Filtered drift' }
  )
}

const updateProductsSelectedField = (value: string) => {
  productsSelectedField.value = value
}
</script>
