<template>
  <div v-if="product" class="page">
    <OrganismsProductCardsProduct
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
const route = useRoute()
const {
  fetchProductBySlug,
  fetchProductPrices
} = await useProducts()

const product = await fetchProductBySlug(route.params.slug as string)

if (product && product.id) {
  product.prices = await fetchProductPrices(product.id)
}
</script>