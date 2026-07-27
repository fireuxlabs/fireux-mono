<template>
  <div class="market-home">
    <section class="market-page market-landing" aria-labelledby="market-title">
      <div class="market-landing__content">
        <p class="market-eyebrow">{{ copy('home_region') }}</p>
        <h1 id="market-title">
          <span>Interlaken</span>
          <span>Essen</span>
        </h1>
        <p class="market-intro">{{ copy('home_market_intro') }}</p>

        <MarketLaunchNotice />

        <nav class="market-actions" :aria-label="copy('home_actions_label')">
          <NuxtLink to="/choufe" class="market-action market-action--light">
            <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
            <strong>{{ copy('buy') }}</strong>
            <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
          </NuxtLink>

          <NuxtLink to="/verchoufe" class="market-action market-action--dark">
            <UIcon name="i-lucide-circle-plus" aria-hidden="true" />
            <strong>{{ copy('sell') }}</strong>
            <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
          </NuxtLink>

          <NuxtLink
            to="/jobs"
            class="market-action market-action--quiet market-action--jobs"
          >
            <UIcon name="i-lucide-briefcase-business" aria-hidden="true" />
            <strong>{{ copy('jobs') }}</strong>
            <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
          </NuxtLink>
        </nav>
      </div>
    </section>

    <section class="market-home__feed-wrap" :aria-label="copy('feed')">
      <MarketplaceShared class="market-home__feed" />
    </section>

    <MarketOnboardingModal />
  </div>
</template>

<script setup lang="ts">
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'

definePageMeta({
  layout: 'marketplace',
})

const { copy } = useInterlakenCopy()

useSeoMeta({
  title: () => copy('home_seo_title'),
  description: () => copy('home_seo_description'),
})
</script>
