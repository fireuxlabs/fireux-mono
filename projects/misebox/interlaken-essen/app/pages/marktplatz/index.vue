<template>
  <section
    class="market-page market-directory"
    aria-labelledby="marketplace-title"
  >
    <div class="market-directory__content">
      <header class="market-directory__heading">
        <p class="market-eyebrow">{{ copy('marketplace_eyebrow') }}</p>
        <h1 id="marketplace-title">{{ copy('marketplace_title') }}</h1>
        <p class="market-intro">{{ copy('marketplace_intro') }}</p>
      </header>

      <div v-if="stores.length || previewSellers.length" class="market-seller-grid">
        <MarketplaceCanonicalSellerCard
          v-for="store in stores"
          :key="store.id"
          :store="store"
        />
        <MarketplaceSellerCard
          v-for="seller in previewSellers"
          :key="seller.id"
          :seller="seller"
        />
      </div>

      <div v-else class="market-directory__empty">
        <UIcon name="i-lucide-store" aria-hidden="true" />
        <div>
          <h2>{{ copy('marketplace_empty_title') }}</h2>
          <p>{{ copy('marketplace_empty_body') }}</p>
        </div>
        <NuxtLink to="/auth" class="market-action market-action--light">
          <UIcon name="i-lucide-circle-plus" aria-hidden="true" />
          <strong>{{ copy('register_business') }}</strong>
          <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import {
  marketplacePreviewSellers,
} from '@/content/marketplace-preview'
import type {
  PublicMarketplaceStoreListResponse,
} from 'fireux-marketplace/runtime/models/marketplace-api.model'

definePageMeta({
  layout: 'marketplace',
})

const { copy } = useInterlakenCopy()
const { data } = await useFetch<PublicMarketplaceStoreListResponse>(
  '/api/public/marketplace/stores',
  { default: () => ({ items: [], truncated: false }) }
)
const stores = computed(() => data.value?.items || [])
const previewSellers = computed(() => {
  const canonicalIds = new Set(stores.value.map(store => store.id))
  return marketplacePreviewSellers.filter(
    seller => !canonicalIds.has(seller.id)
  )
})

useSeoMeta({
  title: () => copy('marketplace_seo_title'),
  description: () => copy('marketplace_seo_description'),
})
</script>
