<template>
  <PublicProductPricingIndex
    :app-name="appName"
    :description="description"
    :tiers="tiers"
    intro="Free runs one Kitchen. Premium unlocks the complete Kitchen Workspace. Business supports multiple Kitchens. Setup, migration, content services, integrations, and custom development are quoted separately."
  />
</template>

<script setup lang="ts">
const { appName, description, tiers } = useMiseboxPricing()

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
    'Misebox pricing for Free, Premium, and Business Kitchen Workspaces and your own branded App.',
})
</script>
