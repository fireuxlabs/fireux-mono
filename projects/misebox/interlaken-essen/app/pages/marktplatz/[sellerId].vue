<template>
  <section
    class="market-page market-storefront"
    aria-labelledby="storefront-title"
  >
    <MarketplaceStorefront :seller="seller" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import {
  findMarketplacePreviewSeller,
} from '@/content/marketplace-preview'

definePageMeta({
  layout: 'marketplace',
})

const { copy } = useInterlakenCopy()
const sellerId = useRouteParam('sellerId')
const seller = computed(() =>
  findMarketplacePreviewSeller(sellerId.value)
)

if (!seller.value) {
  throw createError({
    statusCode: 404,
    statusMessage: copy('storefront_not_found'),
  })
}

useSeoMeta({
  title: () =>
    `${copy(seller.value?.nameKey || 'storefront_honey_name')} – Interlaken Essen`,
  description: () =>
    copy(
      seller.value?.descriptionKey || 'storefront_honey_description'
    ),
})
</script>
