<template>
  <UPage>
  <UPageBody class="pagebody">
  <div v-if="pending && !product" class="space-y-4">
    <USkeleton class="h-48 rounded-3xl" />
    <USkeleton class="h-36 rounded-3xl" />
  </div>
  <div v-else-if="product" class="page">
    <ProductViewProduct
      mode="fetch"
      variant="page"
      :product="product"
      :prices="prices"
      :default-price="defaultPrice"
    />
  </div>
  <UPageCard v-else-if="failed" title="Product unavailable" description="This product could not be loaded right now." icon="i-lucide-cloud-alert" />
  <UPageCard v-else title="Product not found" description="This product does not exist or is not published here." icon="i-lucide-package-x" />
  <DevDebugPanel
    object-origin="fetched"
    launcher
    include-route
    title="Product (JSON)"
    context="canonical Product plus joined ProductPrice children"
    :objects="devJsonData"
    :derived="devJsonDerived"
    :default-open="false"
  />
  </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, setResponseStatus, useRoute } from '#imports'
import { readRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useProductDetail } from '../../product/composables/useProductDetail'
import { useProductSeo } from '../../product/composables/useProductSeo'

const route = useRoute()
const slug = readRouteParam(route.params.slug)

const { product, prices, defaultPrice, pending, failed, missing, statusCode, ready } = useProductDetail(slug)
await ready

if (import.meta.server) {
  if (missing.value) setResponseStatus(404)
  else if (failed.value) setResponseStatus(statusCode.value >= 500 ? statusCode.value : 503)
}

useProductSeo(product, defaultPrice)

const devJsonData = computed(() => product.value ? [product.value] : [])
const devJsonDerived = computed(() => ({
  productPrices: prices.value,
  defaultPrice: defaultPrice.value,
}))
</script>
