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

      <div v-if="sellers.length" class="market-seller-grid">
        <article
          v-for="seller in sellers"
          :key="seller.id"
          class="market-seller-card"
        >
          <img :src="seller.image" :alt="seller.imageAlt">
          <div class="market-seller-card__body">
            <span>{{ seller.place }}</span>
            <h2>{{ seller.name }}</h2>
            <p>{{ seller.description }}</p>
          </div>
        </article>
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

type MarketSeller = {
  id: string
  name: string
  place: string
  description: string
  image: string
  imageAlt: string
}

const sellers: MarketSeller[] = []

definePageMeta({
  layout: 'marketplace',
})

const { copy } = useInterlakenCopy()

useSeoMeta({
  title: () => copy('marketplace_seo_title'),
  description: () => copy('marketplace_seo_description'),
})
</script>
