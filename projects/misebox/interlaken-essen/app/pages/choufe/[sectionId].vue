<template>
  <section
    class="market-page market-landing market-browse"
    :aria-labelledby="titleId"
  >
    <div class="market-landing__content">
      <p class="market-eyebrow">
        <NuxtLink to="/choufe">Choufe</NuxtLink>
      </p>
      <h1 :id="titleId">{{ section.label }}</h1>
      <p class="market-intro">{{ section.description }}</p>
      <MarketplaceShared />
    </div>
  </section>
</template>

<script setup lang="ts">
import { findMarketSection } from '../../content/market-sections'

definePageMeta({
  layout: 'marketplace',
})

const route = useRoute()
const sectionId = String(route.params.sectionId || '')
const section = findMarketSection(sectionId)

if (!section) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Die Kategorie git’s nid.',
  })
}

const titleId = `section-${section.id}`

useSeoMeta({
  title: `${section.label} – Interlaken Essen`,
  description: section.description,
})
</script>
