<template>
  <UPage>
    <UPageHeader title="Dev · Apps" />
    <UPageBody>
      <UAlert title="Legacy development screen retired" description="This screen no longer loads or changes application data." color="neutral" variant="soft" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 20,
  },
  title: 'Dev · Apps',
  description: 'Developer view for Apps (collection-first).',
})
</script>
