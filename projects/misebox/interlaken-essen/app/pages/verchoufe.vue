<template>
  <section
    id="betrieb-registriere"
    class="market-page market-landing market-browse"
    aria-labelledby="sell-title"
  >
    <div class="market-landing__content">
      <VerchoufeMain id="sell-title" />
      <MarketplaceShared />
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
  title: () => copy('sell_seo_title'),
  description: () => copy('sell_seo_description'),
})
</script>
