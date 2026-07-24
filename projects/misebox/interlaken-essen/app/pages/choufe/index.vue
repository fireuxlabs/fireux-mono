<template>
  <section
    class="market-page market-landing market-browse market-browse--feed"
    aria-labelledby="buy-title"
  >
    <div class="market-landing__content">
      <div class="market-browse__columns">
        <ChoufeMain id="buy-title" />
        <MarketplaceShared />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'

definePageMeta({
  layout: 'marketplace',
})

const { copy } = useInterlakenCopy()

useSeoMeta({
  title: () => copy('buy_seo_title'),
  description: () => copy('buy_seo_description'),
})
</script>
