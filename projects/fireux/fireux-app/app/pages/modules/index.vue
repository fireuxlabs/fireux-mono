<!-- Concurrent edit — 2026-07-21 16:17 CEST — Module family design: establish Modules as reusable capability composition. -->
<template>
  <UPage>
    <UPageHeader
      headline="FireUX capability family"
      title="Modules"
      description="Modules add reusable capability to an app. A module may bring records, Console Operations, tools, public surfaces, or several of them together."
    />

    <UPageBody>
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
  description: 'Browse reusable FireUX extension modules.',
})

useSeoMeta({
  title: 'FireUX Modules - Reusable App Capabilities',
  description:
    'Browse reusable FireUX modules that add entities, operations, tools, and solution capability to apps.',
})
</script>
