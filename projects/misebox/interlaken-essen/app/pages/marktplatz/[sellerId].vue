<template>
  <section
    class="market-page market-storefront"
    aria-labelledby="storefront-title"
  >
    <MarketplaceCanonicalStorefront
      v-if="canonicalStore"
      :store="canonicalStore"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
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

if (!canonicalStore.value) {
  throw createError({
    statusCode: 404,
    statusMessage: copy('storefront_not_found'),
  })
}

useSeoMeta({
  title: () => `${canonicalStore.value?.name || ''} – Interlaken Essen`,
  description: () => canonicalStore.value?.description || '',
})
</script>
