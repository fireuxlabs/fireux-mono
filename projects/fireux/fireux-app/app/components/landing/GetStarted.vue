<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: point cleaning discovery at the Werkbox category. -->
<template>
  <LandingCardGrid
    :title="title"
    :subtitle="subtitle"
    :items="items"
  />
</template>

<script setup lang="ts">
const title = 'Get started'
const subtitle = 'Choose an existing app or launch one for your own workflow.'

const items = [
  {
    title: 'Starter app',
    description: 'Launch a focused, branded business app from $150 setup and $15/month.',
    to: '/pricing/apps',
    cta: 'Compare offers',
    icon: 'i-lucide-rocket',
  },
  {
    title: 'Misebox',
    description: 'Explore our hospitality ecosystem for kitchens, menus, teams, and daily operations.',
    to: 'https://misebox.app',
    cta: 'Explore hospitality',
    icon: 'i-lucide-chef-hat',
  },
  {
    title: 'Werkbox',
    description: 'Explore cleaning and other practical work through the shared Werkbox hub.',
    to: '/ecosystems/werkbox/cleaning',
    cta: 'Explore cleaning',
    icon: 'i-lucide-sparkles',
  },
  {
    title: 'Your own ecosystem',
    description: 'Turn a repeatable industry workflow into a branded parent app with customer apps beneath it.',
    to: '/ecosystems/pricing',
    cta: 'See ecosystem pricing',
    icon: 'i-lucide-network',
  },
  {
    title: 'Browse the app family',
    description: 'See the apps already connected to FireUX and find the closest starting point.',
    to: '/apps',
    cta: 'Browse apps',
    icon: 'i-lucide-layout-grid',
  },
  {
    title: 'Talk to FireUX',
    description: 'Tell us what the app needs to do and who needs to use it.',
    to: 'mailto:fire@fireux.app?subject=FireUX%20starter%20app',
    cta: 'Email us',
    icon: 'i-lucide-mail',
  },
]
</script>
