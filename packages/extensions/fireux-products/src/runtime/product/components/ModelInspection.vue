<!-- Concurrent edit — 2026-07-20 11:44 CEST — Root Efficiency Pass 4 of 4: use the Products-owned Product fixture. -->
<!-- Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: keep Product dev diagnostics on live model and collection data. -->
<template>
  <section class="space-y-10">
    <UCard>
      <FireDiagnosticsModel
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
              Inspect model drift separately from the public products collection
              manager.
            </p>
            <FireDiagnosticsDriftToolbar
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

      <FireStateCard
        v-if="productCollection.outcome === 'pending'"
        entity="Product"
        kind="collection"
        loading
      />
      <FireStateCard
        v-else-if="productCollection.outcome === 'error'"
        entity="Product"
        kind="collection"
        state="error"
      />
      <ProductCollection v-else :products="productCollection.products" />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
const productCollection = reactive(useProductCollection({ admin: true }))

import { useDiagnosticsDriftFilter } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsDriftFilter'
import { computed } from 'vue'
import { useProductCollection } from '../composables/useProductCollection'
import { ProductDefaults, type Product } from '../utils/product.ts'

defineOptions({ name: 'ProductModelInspection' })

const productModelRuntime = { ...ProductDefaults }
const products = computed(() => productCollection.products)

const productsCollection = computed<Product[]>(() => products.value ?? [])

const {
  driftKind,
  setDriftKind,
  selectedField,
  setSelectedField,
  filterOptions,
  buildDriftPayload,
  buildCopyPayload,
} = useDiagnosticsDriftFilter({
  collection: productsCollection,
  runtimeModel: productModelRuntime,
  driftMode: 'extras-only',
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
    'packages/extensions/fireux-products/src/runtime/product/models/product.model.ts',
  itemsKey: 'products',
  items: filteredDriftPayload,
  total: computed(() => productsCollection.value.length),
})
</script>
