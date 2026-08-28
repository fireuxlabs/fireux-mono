<template>
  <AppPricingCatalogue
    :app-name="appName"
    :description="description"
    :tiers="tiers"
    intro="Free starts one Project. Professional completes one Project. Business operates multiple Projects. Your App launches a separate managed App, while Your Ecosystem creates a SaaS system whose owner manages its customers."
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
    'FireUX pricing for Workspaces, standalone Apps, and product ecosystems.',
})
</script>
