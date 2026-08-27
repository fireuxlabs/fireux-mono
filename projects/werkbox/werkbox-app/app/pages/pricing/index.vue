<template>
  <PricingCatalogue
    :app-name="appName"
    :description="description"
    :tiers="tiers"
  />
</template>

<script setup lang="ts">
const { appName, description, tiers } = useWerkboxPricing()

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
  title: 'Pricing · Werkbox',
  description:
    'Werkbox pricing for the Work Workspace, managed service, and your own App.',
})
</script>
