<template>
  <UPage>
    <UPageHeader
      title="FireUX modules"
      description="Browse published module records in the FireUX ecosystem."
    />

    <UPageBody>
      <ModuleCTA />

      <ModuleCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  tag: 'modules',
  nav: {
    key: 'modules',
    label: 'Modules',
    icon: 'i-lucide-puzzle',
    order: 70,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  title: 'Modules',
  description: 'Browse published FireUX modules.',
})

useSeoMeta({
  title: 'FireUX Modules',
  description:
    'Browse published FireUX modules available to apps and ecosystems.',
})

</script>
