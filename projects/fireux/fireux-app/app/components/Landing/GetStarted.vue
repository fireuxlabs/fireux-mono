<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: point cleaning discovery at the Werkbox category. -->
<template>
  <FireLandingCardGrid :title="title" :subtitle="subtitle" :items="items" />
</template>

<script setup lang="ts">
const title = 'Get started'
const subtitle = 'Choose an existing app or launch one for your own workflow.'

const items = [
  {
    title: 'Your App',
    description:
      'Launch a standalone branded FireUX App for CHF 600 setup including one Entity, then CHF 50/month per Entity.',
    to: '/pricing/your-app',
    cta: 'Compare offers',
    icon: 'i-lucide-rocket',
  },
  {
    title: 'Explore Ecosystems',
    description: 'Find an ecosystem for your industry.',
    to: '/ecosystems',
    cta: 'Browse Ecosystems',
    icon: 'i-lucide-orbit',
  },
  {
    title: 'Your own ecosystem',
    description:
      'Create a product ecosystem that can launch and support its own customer Apps.',
    to: '/pricing/your-ecosystem',
    cta: 'See ecosystem pricing',
    icon: 'i-lucide-network',
  },
  {
    title: 'Browse the app family',
    description:
      'See the apps already connected to FireUX and find the closest starting point.',
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
