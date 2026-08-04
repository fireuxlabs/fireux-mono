<template>
  <PublicProductPricingIndex />
</template>

<script setup lang="ts">
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
  description: 'FireUX pricing for Consoles, standalone Apps, and product ecosystems.',
})
</script>
