<template>
  <UPage>
    <UPageBody>
      <FireState
        :outcome="outcome"
        entity="Menu Express"
        :error="error"
        retryable
        @retry="refresh"
      />
      <template v-if="product">
        <ProductSurface
          :product="product"
          primary
          :action="{ label: 'Send us your menu', to: '/menu-express' }"
          :preview-component="KitchenOffersPreview"
          :preview-props="{ kind: 'menu' }"
        />
        <MenuExpressOffer />
      </template>
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import KitchenOffersPreview from 'fireux-kitchens/runtime/kitchen/components/Offers/Preview.vue'
import { useProductDetail } from 'fireux-products/runtime/product/composables/useProductDetail'
definePageMeta({
  layout: 'default',
  title: 'Menu Express',
  nav: {
    key: 'menu-express-product',
    label: 'Menu Express',
    icon: 'i-lucide-qr-code',
    order: 20,
    position: 'top',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
})
const { product, outcome, error, refresh, ready } =
  useProductDetail('menu-express')
await ready
useSeoMeta({
  title: 'Menu Express · Misebox',
  description: () =>
    product.value?.description ||
    'Menu preparation, review and publication with Misebox.',
  robots: 'noindex, nofollow',
})
</script>
