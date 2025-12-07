<template>
  <UPage>
    <UPageHeader
      title="Products"
      description="Catalog of products available across this runtime."
    />

    <UPageBody>
      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <div v-else-if="!products.length" class="space-y-2 text-sm text-gray-500">
        <p>No products found.</p>
        <p>Add a product to populate the catalog.</p>
      </div>

      <FireOrganismsProductCardsList v-else :products="products" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProducts } from '../../composables/firestore/objects/Product/useProducts'

definePageMeta({
  layout: 'default',
  title: 'Products',
  nav: {
    key: 'products',
    label: 'Products',
    icon: 'i-lucide-box',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

const { productsCollection } = await useProducts()
const pending = computed(() => productsCollection.value === undefined)
const products = computed(() => productsCollection.value ?? [])
</script>
