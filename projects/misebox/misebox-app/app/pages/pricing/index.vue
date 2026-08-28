<template>
  <AppPricingCatalogue
    :app-name="appName"
    :description="description"
    :tiers="tiers"
    intro="Free starts one Kitchen. Professional completes one Kitchen. Business operates multiple Kitchens. Managed adds agreed work to selected Kitchens. Your App creates a separate branded Misebox product."
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
    'Misebox pricing for Free, Professional, Business, Managed, and your own branded App.',
})
</script>
