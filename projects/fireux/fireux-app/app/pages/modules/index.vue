<template>
  <UPage>
    <UPageHeader
      title="Modules"
      description="Browse FireUX modules available to this runtime."
    />

    <UPageBody class="pagebody">
      <ProductCollectionManager :collection="moduleCollection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductFetch } from 'fireux-products/runtime/composables/fireux/firestore/objects/product/fetch/useProductFetch'

definePageMeta({
  nav: {
    key: 'modules',
    label: 'Modules',
    icon: 'i-lucide-puzzle',
    desktop: true,
    mobile: true,
  },
})

useSeoMeta({
  title: 'FireUX Modules',
  description: 'FireUX modules available for this runtime.',
})

const { products } = useProductFetch()
const moduleCollection = computed(() =>
  (products.value ?? []).filter((product) => product.product_type === 'module')
)
</script>
