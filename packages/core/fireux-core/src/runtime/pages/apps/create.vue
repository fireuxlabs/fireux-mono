<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="App creation is not available here"
      description="You can explore existing Apps."
    />

    <UPageBody class="pagebody">
      <UButton to="/apps" icon="i-lucide-app-window">Explore Apps</UButton>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'

definePageMeta({
  layout: 'default',
  requiresAuth: false,
  appRole: 'global',
  title: 'App creation unavailable',
  description: 'App creation is not available from this page.',
  nav: {
    key: 'apps-create',
    label: 'App creation',
    icon: 'i-lucide-app-window',
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  name: 'AppsCreatePage',
})

useHead({ title: 'App creation unavailable' })
</script>
