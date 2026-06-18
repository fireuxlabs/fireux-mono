<template>
  <ProductCollectionManager
    :collection="modules"
    title="Modules"
    description="Browse published FireUX module records."
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductCollection } from 'fireux-products/runtime/composables/fireux/firestore/product/fetch/useProductCollection'

const { products } = useProductCollection()

const text = (value: unknown) => String(value ?? '').trim()

const modules = computed(() =>
  (products.value ?? [])
    .filter((product) => product.product_type === 'module')
    .filter((product) => product.active !== false)
    .filter((product) => text(product.id))
    .sort((a, b) => text(a.name).localeCompare(text(b.name)))
)
</script>
