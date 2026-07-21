<!-- Concurrent edit — 2026-07-21 16:03 CEST — Extension module catalogue: make reusable packages the primary Modules surface. -->
<template>
  <UPage>
    <UPageHeader
      title="FireUX modules"
      description="Reusable extensions for FireUX apps."
    />

    <UPageBody>
      <ModuleCollectionManager />

      <div class="flex justify-end">
        <UButton
          to="/modules/learn-more"
          color="neutral"
          variant="soft"
          icon="i-lucide-book-open"
        >
          How modules work
        </UButton>
      </div>
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
  title: 'FireUX Modules',
  description:
    'Browse reusable FireUX extension modules for apps and ecosystems.',
})
</script>
