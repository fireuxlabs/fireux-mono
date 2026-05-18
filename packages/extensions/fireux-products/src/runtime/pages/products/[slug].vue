<template>
  <div v-if="product" class="page">
    <ProductViewProduct
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
import { useProduct } from '../../composables/fireux/firestore/product/useProduct'

const route = useRoute()
const { fetchProduct, fetchProductPrices } = useProduct()

const product = await fetchProduct(route.params.slug as string)

if (product && product.id) {
  product.prices = await fetchProductPrices(product.id)
}
</script>
