<template>
  <UPage>
    <UPageHeader
      title="Products"
      description="Catalog of products available across this runtime."
    />

    <UPageBody class="space-y-6">
      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <template v-else>
        <FireOrganismsProductCTA v-if="showCTA" />

        <div v-if="!products.length" class="space-y-2 text-sm text-gray-500">
          <p>No products found.</p>
          <p>Add a product to populate the catalog.</p>
        </div>

        <FireOrganismsProductCardsList v-else :products="products" />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '#fireux-core-composables/fireux/firestore/core/user/useUser'
import { useProducts } from '../../composables/fireux/firestore/objects/Product/useProducts'

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
const { isAdmin, isLoading } = useUser()
const showCTA = computed(() => !isLoading.value && isAdmin.value)
</script>
