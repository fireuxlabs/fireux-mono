<template>
  <UPage>
    <UPageHeader title="Dev · Images" />
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
    key: 'dev-images',
    label: 'Images',
    icon: 'i-lucide-image',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 40,
  },
  title: 'Dev · Images',
  description: 'Inspect platform assets inherited from fireux-core.',
})
</script>
