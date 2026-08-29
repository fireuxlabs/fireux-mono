<template>
  <AppPricingCatalogue :tiers="tiers" />
</template>

<script setup lang="ts">
const { tiers } = useFireuxPricing()

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
  title: 'Pricing · FireUX',
  description:
    'FireUX pricing for Workspaces, standalone Apps, and product ecosystems.',
})
</script>
