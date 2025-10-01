<template>
  <div class="page">
    <h1>Products</h1>
    <template v-if="productsCollection">
      <FireOrganismsProductCardsList :products="productsCollection" />
    </template>
    <template v-else>
      <div class="p-8 text-center text-gray-500 text-lg">
        Loading products...
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useProducts } from '../../composables/firestore/objects/Product/useProducts'
// Nuxt macro: declare for TS in package runtime
declare function definePageMeta(meta: any): void

definePageMeta({
  nav: {
    key: 'products',
    label: 'Products',
    icon: 'i-lucide-box',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

const { productsCollection } = await useProducts()
</script>

<style scoped>
/* Let components handle their own spacing with Tailwind/NuxtUI utilities */
</style>
