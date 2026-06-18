<template>
  <UPage>
    <UPageHeader
      title="FireUX apps"
      description="Browse published app records in the FireUX ecosystem."
    />

    <UPageBody>
      <AppCTA />

      <AppCollectionManager
        title="Apps"
        description="Browse the full published app collection."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  tag: 'apps',
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  title: 'Apps',
  description: 'Browse published FireUX apps.',
  layout: 'default',
  name: 'FireuxAppsIndexPage',
})

useSeoMeta({
  title: 'FireUX Apps',
  description:
    'Browse published app records in the FireUX ecosystem, including standalone apps and ecosystem surfaces.',
})

</script>
