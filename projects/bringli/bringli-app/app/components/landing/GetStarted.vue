<template>
  <LandingCardGrid
    :title="title"
    :subtitle="subtitle"
    :items="items"
  />
</template>

<script setup lang="ts">
const title = 'Get started'
const subtitle = 'Supplier operations, delivery readiness, and local market execution.'

const items = [
  {
    title: 'Supplier Directory',
    description:
      'Centralize producer and supplier profiles with simple filtering for quality and fit.',
    to: '/suppliers',
    icon: 'i-lucide-search',
  },
  {
    title: 'Delivery Coverage',
    description:
      'Map service areas and dropoff expectations for homes and business locations.',
    to: '/suppliers',
    icon: 'i-lucide-map',
  },
  {
    title: 'Supplier Readiness',
    description:
      'Capture onboarding status and move each supplier to ready-to-serve faster.',
    to: '/suppliers',
    icon: 'i-lucide-list-checks',
  },
]
</script>
