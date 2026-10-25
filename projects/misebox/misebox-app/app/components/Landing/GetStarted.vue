<template>
  <FireLandingCardGrid
    :title="title"
    :subtitle="subtitle"
    :items="items"
  />
</template>

<script setup lang="ts">
const title = 'Get started'
const subtitle =
  'Connect your menu, preparation, and service workflow in one Kitchen workspace.'

const items = [
  {
    title: 'Create a Kitchen workspace',
    description: 'Start with Kitchen identity, operator access, and the menu you serve.',
    to: '/kitchens',
    icon: 'i-lucide-chef-hat',
  },
  {
    title: 'Try the interactive demo',
    description: 'Follow a sample menu from guest choice to Kitchen handoff.',
    to: '/demo',
    icon: 'i-lucide-monitor-play',
  },
  {
    title: 'See what works today',
    description: 'Inspect the working Kitchen operations without decoding a roadmap.',
    to: '/operations',
    icon: 'i-lucide-list-checks',
  },
]
</script>
