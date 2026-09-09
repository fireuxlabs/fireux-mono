<template>
  <UPage>
    <UPageHeader title="Dev · Overview" />
    <UPageBody>
      <UAlert title="Legacy development screen retired" description="This screen no longer loads or changes application data." color="neutral" variant="soft" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
definePageMeta({
  title: 'Dev · Overview',
  description: 'Diagnostics and inspection utilities for the active FireUX runtime.',
  layout: 'dev',
  nav: {
    key: 'dev-index',
    label: 'Overview',
    icon: 'i-lucide-wrench',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 10,
  },
})
</script>
