<template>
  <NuxtLink :to="seller.route" class="market-seller-card">
    <MarketplaceHoneyArtwork :alt="copy(seller.imageAltKey)" />
    <div class="market-seller-card__body">
      <span>{{ copy('storefront_preview_label') }}</span>
      <h2>{{ copy(seller.nameKey) }}</h2>
      <p class="market-seller-card__place">{{ seller.place }}</p>
      <p>{{ copy(seller.descriptionKey) }}</p>
      <strong class="market-seller-card__action">
        {{ copy('storefront_open_shop') }}
        <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
      </strong>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import type {
  MarketplacePreviewSeller,
} from '@/content/marketplace-preview'

defineProps<{
  seller: MarketplacePreviewSeller
}>()

const { copy } = useInterlakenCopy()
</script>
