<template>
  <UPage>
    <UPageHeader
      title="FireUX Docs"
      description="Build a Nuxt App with FireUX, from configuration to server code."
    />

    <UPageBody>
      <UPageSection
        v-for="group in groups"
        :key="group.title"
        :title="group.title"
      >
        <UPageGrid>
          <UPageCard
            v-for="guide in group.guides"
            :key="guide.to"
            :title="guide.label"
            :description="guide.description"
            :icon="guide.icon"
            :to="guide.to"
            variant="subtle"
          />
        </UPageGrid>
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'docs', title: 'FireUX Docs' })
useSeoMeta({
  title: 'FireUX Docs',
  description: 'Guides and reference for building Apps with FireUX.',
})

const groups = [
  {
    title: 'Ignight',
    guides: [
      {
        label: 'Getting started',
        description: 'Run the starter App locally.',
        icon: 'i-lucide-play',
        to: '/getting-started',
      },
      {
        label: 'App configuration',
        description: 'Set the App identity and choose its layers and modules.',
        icon: 'i-lucide-settings-2',
        to: '/docs/configuration',
      },
      {
        label: 'Templates',
        description: 'See what comes with the FireUX starter App.',
        icon: 'i-lucide-layout-template',
        to: '/templates',
      },
    ],
  },
  {
    title: 'Fuel',
    guides: [
      {
        label: 'Pages',
        description: 'Compose a page around one reader and shared read states.',
        icon: 'i-lucide-file-text',
        to: '/docs/pages',
      },
      {
        label: 'Layouts',
        description: 'See how AppShell frames site pages and Workspaces.',
        icon: 'i-lucide-panels-top-left',
        to: '/docs/layouts',
      },
      {
        label: 'Components',
        description: 'Use FireUX controls alongside Nuxt UI.',
        icon: 'i-lucide-blocks',
        to: '/docs/components',
      },
      {
        label: 'Composables',
        description: 'Read App data and handle loading and errors.',
        icon: 'i-lucide-app-window',
        to: '/docs/composables',
      },
      {
        label: 'Server',
        description:
          'Return public data and check permission for protected actions.',
        icon: 'i-lucide-server',
        to: '/docs/server',
      },
    ],
  },
  {
    title: 'Examples and packages',
    guides: [
      {
        label: 'Patterns',
        description: 'See how the parts work together.',
        icon: 'i-lucide-panels-top-left',
        to: '/patterns',
      },
      {
        label: 'Packages',
        description: 'See which FireUX packages this App uses.',
        icon: 'i-lucide-package',
        to: '/packages',
      },
    ],
  },
] as const
</script>
