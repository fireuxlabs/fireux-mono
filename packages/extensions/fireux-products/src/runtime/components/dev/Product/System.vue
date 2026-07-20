<!-- Concurrent edit — 2026-07-20 11:44 CEST — Root Efficiency Pass 4 of 4: use the Products-owned Product fixture. -->
<!-- Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: keep Product dev diagnostics on live model and collection data. -->
<template>
  <section class="space-y-10">
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
            <p class="text-sm font-semibold text-highlighted">
              Products collection
            </p>
            <p class="text-xs text-muted">
              Inspect model drift separately from the public products collection manager.
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

      <ProductCollectionManager />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useProductCollection } from '../../../composables/fireux/firestore/product/fetch/useProductCollection'
import {
  FirebaseProduct as ProductModelRuntime,
  type FirebaseProduct,
} from '../../../models/product.model'

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
    'packages/extensions/fireux-products/src/runtime/models/product.model.ts',
  itemsKey: 'products',
  items: filteredDriftPayload,
  total: computed(() => productsCollection.value.length),
})
</script>
