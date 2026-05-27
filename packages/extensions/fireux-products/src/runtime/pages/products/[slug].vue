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
import { useAsyncData, useRoute } from '#imports'
import { useProductSeo } from '../../composables/fireux/firestore/product/utils/useProductSeo'
import type { FirebaseProduct } from '../../models/product.model'

const route = useRoute()
const slug = String(route.params.slug || '').trim()

const { data: product } = await useAsyncData(
  `product-${slug}`,
  () => $fetch<FirebaseProduct>(`/api/products/${encodeURIComponent(slug)}`)
)

useProductSeo(product)
</script>
