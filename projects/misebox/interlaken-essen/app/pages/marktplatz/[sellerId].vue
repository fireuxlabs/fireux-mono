<template>
  <section
    class="market-page market-storefront"
    aria-labelledby="storefront-title"
  >
    <MarketplaceCanonicalStorefront
      v-if="canonicalStore"
      :store="canonicalStore"
    />
    <MarketplaceStorefront v-else-if="previewSeller" :seller="previewSeller" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import {
  findMarketplacePreviewSeller,
} from '@/content/marketplace-preview'
import type {
  PublicMarketplaceStoreResponse,
} from 'fireux-marketplace/runtime/models/marketplace-api.model'

definePageMeta({
  layout: 'marketplace',
})

const { copy } = useInterlakenCopy()
const sellerId = useRouteParam('sellerId')
const { data } = await useFetch<PublicMarketplaceStoreResponse>(
  () => `/api/public/marketplace/stores/${encodeURIComponent(sellerId.value)}`,
  { default: () => null }
)
const canonicalStore = computed(() => data.value?.store)
const previewSeller = computed(() =>
  findMarketplacePreviewSeller(sellerId.value)
)

if (!canonicalStore.value && !previewSeller.value) {
  throw createError({
    statusCode: 404,
    statusMessage: copy('storefront_not_found'),
  })
}

useSeoMeta({
  title: () =>
    `${canonicalStore.value?.name || copy(previewSeller.value?.nameKey || 'storefront_honey_name')} – Interlaken Essen`,
  description: () =>
    canonicalStore.value?.description ||
    copy(previewSeller.value?.descriptionKey || 'storefront_honey_description'),
})
</script>
