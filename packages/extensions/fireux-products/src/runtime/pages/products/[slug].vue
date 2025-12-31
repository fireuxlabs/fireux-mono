<template>
  <div v-if="product" class="page">
    <OrganismsObjectsProductViewProduct
      mode="fetch"
      variant="page"
      :product="product"
    />
  </div>
  <div v-else>
    <h1>404 – Product not found</h1>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { useProducts } from '../../composables/fireux/firestore/objects/product/useProducts'

const route = useRoute()
const { fetchProductBySlug, fetchProductPrices } = await useProducts()

const product = await fetchProductBySlug(route.params.slug as string)

if (product && product.id) {
  product.prices = await fetchProductPrices(product.id)
}
</script>
