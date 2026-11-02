<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Products"
        description="Explore FireUX Apps, templates and modules for the product you are building."
      />
      <UPageBody>
        <FireState
          :outcome="catalogue.outcome"
          entity="products"
          :error="catalogue.error"
        />
        <ProductCollection
          v-if="catalogue.outcome === 'ready'"
          :products="catalogue.products"
        />
        <UPageCard
          title="Products for your Kitchen"
          description="Explore Menu Express and Collection Ordering in Misebox’s Product catalogue."
          icon="i-lucide-utensils"
          :to="miseboxProducts"
        />
        <ProductDirectoryActions />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useProductCollection } from 'fireux-products/runtime/product/composables/useProductCollection'

const catalogue = reactive(useProductCollection())
const miseboxProducts = import.meta.dev
  ? 'http://localhost:3001/products'
  : 'https://misebox.app/products'

definePageMeta({
  layout: 'framework',
  title: 'Products',
  name: 'FireuxProductsIndexPage',
  nav: {
    key: 'products',
    label: 'Products',
    icon: 'i-lucide-box',
    order: 35,
    desktop: true,
    mobile: true,
    layouts: ['framework'],
  },
})
useSeoMeta({
  title: 'Products · FireUX',
  description:
    'Explore FireUX Apps, templates and modules, and Misebox products for your Kitchen.',
})
</script>
