<template>
  <LandingCardGrid
    :title="title"
    :subtitle="subtitle"
    :items="items"
  />
</template>

<script setup lang="ts">
const title = 'Marketplace expansion'
const subtitle = 'Next-stage modules for order flow, business accounts, and rollout.'

const items = [
  {
    title: 'Order Pipeline',
    description:
      'Prepare order capture, handoff tracking, and fulfillment visibility.',
    to: '/dev',
    icon: 'i-lucide-package-open',
  },
  {
    title: 'Business Accounts',
    description:
      'Support office, hospitality, and retail buyers with repeatable delivery setups.',
    to: '/dev',
    icon: 'i-lucide-building-2',
  },
  {
    title: 'Market Expansion',
    description:
      'Replicate the Interlaken operating model into the next city with low drift.',
    to: '/dev',
    icon: 'i-lucide-globe',
  },
]
</script>
