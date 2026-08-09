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
import { readRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useProductDetail } from '../../composables/fireux/product/useProductDetail'
import { useProductSeo } from '../../composables/fireux/firestore/product/utils/useProductSeo'

const route = useRoute()
const slug = readRouteParam(route.params.slug)

const { product, ready } = useProductDetail(slug)
await ready

useProductSeo(product)
</script>
