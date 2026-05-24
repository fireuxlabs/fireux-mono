<template>
  <PublicPricingPage
    :description="description"
    :plan-groups="planGroups"
    :json-ld="pricingJsonLd"
  />
</template>

<script setup lang="ts">
import { useEcosystemPricingPage } from 'fireux-core/runtime/composables/fireux/pricing/useEcosystemPricingPage'

const {
  description,
  planGroups,
  pricingJsonLd,
  seoTitle,
  seoDescription,
} = useEcosystemPricingPage()

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'pricing',
    label: 'Pricing',
    icon: 'i-lucide-badge-dollar-sign',
    order: 80,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  twitterCard: 'summary',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
})
</script>
