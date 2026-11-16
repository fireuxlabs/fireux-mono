<template>
  <UPage>
    <UPageHeader title="Collection Ordering" />
    <UPageBody>
      <FireState
        :outcome="outcome"
        entity="Collection Ordering"
        :error="error"
        retryable
        @retry="refresh"
      />
      <template v-if="product">
        <ProductSurface :product="product" />
        <CollectionOrderingOffer />
      </template>
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import { useProductDetail } from 'fireux-products/runtime/product/composables/useProductDetail'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  layout: 'default',
  title: 'Collection Ordering',
})
const { product, outcome, error, refresh, ready } = useProductDetail(
  'collection-ordering'
)
await ready
useSeo({
  title: 'Collection Ordering · Misebox',
  description: () =>
    product.value?.description ||
    'Customer Collection ordering and the Kitchen order board.',
  path: '/products/collection-ordering',
  image: '/img/app/cover.png',
  robots: 'noindex, nofollow',
})
</script>
