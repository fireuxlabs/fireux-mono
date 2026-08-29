<template>
  <AppPricingCatalogue :tiers="tiers" />
</template>

<script setup lang="ts">
import { useBuenoHostPricing } from '../composables/useBuenoHostPricing'

const { tiers } = useBuenoHostPricing()

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
  title: 'Pricing · BuenoHost',
  description:
    'BuenoHost pricing for the Host Workspace, managed service, and your own App.',
})
</script>
