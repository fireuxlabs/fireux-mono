<template>
  <section
    class="market-page market-landing market-browse"
    :aria-labelledby="titleId"
  >
    <div class="market-landing__content">
      <p class="market-eyebrow">
        <NuxtLink to="/choufe">{{ copy('buy') }}</NuxtLink>
      </p>
      <h1 :id="titleId">{{ copy(section.labelKey) }}</h1>
      <p class="market-intro">{{ copy(section.descriptionKey) }}</p>
      <div
        v-if="sectionStores.length"
        class="market-category-sellers"
        :aria-label="copy('storefront_category_sellers')"
      >
        <MarketplaceCanonicalSellerCard
          v-for="store in sectionStores"
          :key="store.id"
          :store="store"
        />
      </div>
      <MarketplaceShared />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import { findMarketSection } from '../../content/market-sections'
import type {
  PublicMarketplaceStore,
  PublicMarketplaceStoreListResponse,
} from 'fireux-marketplace/runtime/models/marketplace-api.model'

definePageMeta({
  layout: 'marketplace',
})

const { copy } = useInterlakenCopy()
const route = useRoute()
const sectionId = String(route.params.sectionId || '')
const section = findMarketSection(sectionId)

if (!section) {
  throw createError({
    statusCode: 404,
    statusMessage: copy('category_not_found'),
  })
}

const titleId = `section-${section.id}`
const { data } = await useFetch<PublicMarketplaceStoreListResponse>(
  '/api/public/marketplace/stores',
  { default: () => ({ items: [], truncated: false }) }
)
const sectionStores = computed(() =>
  (data.value?.items || []).filter((store: PublicMarketplaceStore) =>
    store.section_ids.includes(section.id)
  )
)
useSeoMeta({
  title: () => `${copy(section.labelKey)} – Interlaken Essen`,
  description: () => copy(section.descriptionKey),
})
</script>
