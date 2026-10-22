<template>
  <UPageSection
    id="library"
    title="Developer resources"
    description="Explore the guides, components and application starting points behind the industry SaaS framework."
  >
    <UPageGrid>
      <UPageCard
        v-for="area in areas"
        :key="area.to"
        :title="area.title"
        :description="area.description"
        :icon="area.icon"
        :to="area.to"
      />
    </UPageGrid>
  </UPageSection>
</template>

<script setup lang="ts">
const areas = [
  {
    title: 'Docs',
    description: 'Understand the framework and work from the source workspace.',
    icon: 'i-lucide-book-open',
    to: '/getting-started',
  },
  {
    title: 'Components',
    description: 'Explore native controls and FireUX interaction patterns.',
    icon: 'i-lucide-blocks',
    to: '/components',
  },
  {
    title: 'Theme',
    description: 'Use Nuxt UI colours, variants and semantic roles.',
    icon: 'i-lucide-palette',
    to: '/theme',
  },
  {
    title: 'Templates',
    description: 'Start with the existing FireUX App skeleton.',
    icon: 'i-lucide-panels-top-left',
    to: '/templates',
  },
  {
    title: 'Showcase',
    description: 'Browse the public App directory and its product entries.',
    icon: 'i-lucide-app-window',
    to: '/apps',
  },
]
</script>
