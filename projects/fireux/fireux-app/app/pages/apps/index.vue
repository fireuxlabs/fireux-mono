<template>
  <UPage>
    <UPageHeader
      title="FireUX apps"
      description="Browse published app records in the FireUX ecosystem."
    />

    <UPageBody>
      <!-- Core/platform CTA family: AppCTA starts onboarding; My apps is scoped, browse is the public collection. -->
      <AppCTA />
      <AppCollectionMine />

      <AppCollectionManager
        title="Apps"
        description="Browse published FireUX apps."
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
