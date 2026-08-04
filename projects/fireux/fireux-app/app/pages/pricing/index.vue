<template>
  <PublicProductPricingIndex
    :app-name="appName"
    :description="description"
    :tiers="tiers"
  />
</template>

<script setup lang="ts">
const { appName, description, tiers } = useFireuxPricing()

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
    'FireUX pricing for Consoles, standalone Apps, and product ecosystems.',
})
</script>
