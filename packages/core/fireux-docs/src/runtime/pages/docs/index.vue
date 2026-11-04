<template>
  <UPage>
    <UPageHeader
      title="FireUX Docs"
      description="Learn how to build an App with FireUX."
    />

    <UPageBody>
      <UPageGrid>
        <UPageCard
          v-for="section in sections"
          :key="section.to"
          :title="section.label"
          :description="section.description"
          :icon="section.icon"
          :to="section.to"
          variant="subtle"
        />
      </UPageGrid>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'docs', title: 'FireUX Docs' })
useSeoMeta({
  title: 'FireUX Docs',
  description: 'Guides and reference for building Apps with FireUX.',
})

const sections = [
  {
    label: 'Getting started',
    description: 'Open the starter App and run it locally.',
    icon: 'i-lucide-play',
    to: '/getting-started',
  },
  {
    label: 'Components',
    description: 'See what each FireUX component does and how to use it.',
    icon: 'i-lucide-blocks',
    to: '/docs/components',
  },
  {
    label: 'Composables',
    description: 'Read data in your App and handle loading and errors.',
    icon: 'i-lucide-app-window',
    to: '/docs/composables',
  },
  {
    label: 'Patterns',
    description: 'See how FireUX Apps put pages and actions together.',
    icon: 'i-lucide-panels-top-left',
    to: '/patterns',
  },
  {
    label: 'Packages',
    description: 'See which FireUX packages this App uses.',
    icon: 'i-lucide-package',
    to: '/packages',
  },
] as const
</script>
