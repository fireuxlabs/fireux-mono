<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Apps"
      description="Inspect the current app, its members, and browse all apps available to this runtime."
    />

    <UPageBody class="space-y-6">
      <OrganismsAppSectionsSingle />
      <OrganismsAppSectionsSubcollection />
      <OrganismsAppSectionsCollection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Page meta kept minimal; adjust if you use your nav system here.
declare function definePageMeta(meta: any): void

definePageMeta({
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Apps',
  description: 'FireUX apps resolved for this runtime.',
  layout: 'default',
  name: 'AppsIndexPage',
})
</script>