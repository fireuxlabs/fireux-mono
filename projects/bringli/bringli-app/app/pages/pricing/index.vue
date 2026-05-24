<template>
  <PublicPricingPage
    :description="description"
    :plans="plans"
  />
</template>

<script setup lang="ts">
import { useEcosystemPricingPage } from 'fireux-core/runtime/composables/fireux/pricing/useEcosystemPricingPage'

const {
  description,
  plans,
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
})
</script>
