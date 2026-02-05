<template>
  <section class="space-y-10">
    <DevProductDummy />

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
              :drift-kind="driftKind"
              :selected-field="selectedField"
              :filter-options="filterOptions"
              :copy-label="'Copy drift · Products'"
              :copy-payload="driftCopyPayload"
              @update:drift-kind="setDriftKind"
              @update:selected-field="setSelectedField"
            />
          </div>
        </div>
      </template>

      <ProductCollectionManager :collection="filteredCollection" />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useProductCollection } from '../../../composables/fireux/firestore/objects/product/fetch/useProductCollection'
import {
  FirebaseProduct as ProductModelRuntime,
  type FirebaseProduct,
} from '../../../models/objects/product.model'

defineOptions({ name: 'DevProductSystem' })

const productModelRuntime = ProductModelRuntime

const { products } = useProductCollection()

const productsCollection = computed<FirebaseProduct[]>(() => products.value ?? [])

const {
  driftKind,
  setDriftKind,
  selectedField,
  setSelectedField,
  filterOptions,
  filteredCollection,
  buildDriftPayload,
  buildCopyPayload,
} = useDevDriftFilter({
  collection: productsCollection,
  runtimeModel: productModelRuntime,
  driftMode: 'extras-only',
  requiredPaths: ['slug'],
})

const filteredDriftPayload = buildDriftPayload({
  map: ({ doc, id, drift }) => ({
    id,
    name: doc.name,
    slug: doc.slug,
    drift,
  }),
})

const driftCopyPayload = buildCopyPayload({
  modelPath:
    'packages/extensions/fireux-products/src/runtime/models/objects/product.model.ts',
  itemsKey: 'products',
  items: filteredDriftPayload,
  total: computed(() => productsCollection.value.length),
})
</script>
