<template>
  <AppPricingCatalogue :tiers="tiers" />
</template>

<script setup lang="ts">
const { tiers } = useMiseboxPricing()

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
  title: 'Pricing · Misebox',
  description:
    'Misebox pricing for Free, Professional, Business, Managed, and your own branded App.',
})
</script>
