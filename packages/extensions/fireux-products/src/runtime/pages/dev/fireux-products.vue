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
                :copy-label="'Copy drift · Products'"
                :copy-payload="productsDriftCopyPayload"
                @update:drift-kind="setProductsDriftKind"
                @update:selected-field="updateProductsSelectedField"
              />
            </div>
          </div>
        </template>

        <ProductCollectionManager :collection="filteredProducts" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useProductCollection } from '../../composables/fireux/firestore/objects/product/fetch/useProductCollection'
import { FirebaseProduct as ProductModelRuntime } from '../../models/objects/product.model'

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


const filteredProductsDriftPayload = computed(() =>
  filteredProducts.value.map((product) => {
    const drift = productsDriftById.value.get(product.id) ?? { missing: [], extra: [] }
    return {
      id: product.id,
      name: product.name,
      drift,
    }
  })
)

const productsDriftCopyPayload = computed(() => ({
  modelPath: 'packages/extensions/fireux-products/src/runtime/models/objects/product.model.ts',
  driftKind: productsDriftKind.value,
  selectedField: productsSelectedField.value || null,
  totalProducts: filteredProducts.value.length,
  products: filteredProductsDriftPayload.value,
}))

const updateProductsSelectedField = (value: string) => {
  productsSelectedField.value = value
}
</script>
