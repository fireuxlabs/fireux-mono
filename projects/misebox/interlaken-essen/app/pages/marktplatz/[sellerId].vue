<template>
  <section
    class="market-page market-storefront"
    aria-labelledby="storefront-title"
  >
    <MarketplaceCanonicalStorefront
      v-if="canonicalStore"
      :store="canonicalStore"
    />
    <FireDiagnosticsDebugPanel
      v-if="canonicalStore"
      object-origin="fetched"
      launcher
      include-route
      title="Marketplace Store detail (JSON)"
      context="marketplace detail · Store projection with published Offers as joined child transport"
      :objects="[canonicalStore]"
      :derived="{ sellerId }"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useFetch } from 'nuxt/app'

import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import type { MarketplaceStoreDetailResponse } from 'fireux-marketplace/runtime/marketplace-store/models/marketplace-api.model'

definePageMeta({
  layout: 'marketplace',
})

const { copy } = useInterlakenCopy()
const sellerId = useRouteParam('sellerId')
const { data } = await useFetch<MarketplaceStoreDetailResponse | null>(
  () => `/api/marketplace-stores/${encodeURIComponent(sellerId.value)}`,
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
