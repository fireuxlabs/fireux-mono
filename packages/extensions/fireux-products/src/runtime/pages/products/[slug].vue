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
import { readRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useProductSeo } from '../../composables/fireux/firestore/product/utils/useProductSeo'
import type { FirebaseProduct } from '../../models/product.model'

const route = useRoute()
const slug = readRouteParam(route.params.slug)

const { data: product } = await useAsyncData(
  `product-${slug}`,
  () => $fetch<FirebaseProduct>(`/api/products/${encodeURIComponent(slug)}`)
)

useProductSeo(product)
</script>
