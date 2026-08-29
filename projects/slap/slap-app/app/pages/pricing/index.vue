<template>
  <AppPricingCatalogue :tiers="tiers" />
</template>

<script setup lang="ts">
const { tiers } = useSlapPricing()

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
  title: 'Pricing · Slap',
  description:
    'Slap pricing for the Commerce Workspace, managed service, and your own App.',
})
</script>
