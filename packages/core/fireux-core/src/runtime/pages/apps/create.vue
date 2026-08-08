<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Create an App"
      description="Define a new App. The App hosting this page is the starting point, not the App being created."
    />

    <UPageBody class="pagebody">
      <AppCreateSystem />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import AppCreateSystem from '../../components/App/Create/System.vue'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  tenant: 'global',
  title: 'Create an App',
  description:
    'Start a new App with placement derived from the current environment.',
  nav: {
    key: 'apps-create',
    label: 'Create app',
    icon: 'i-lucide-app-window',
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  name: 'AppsCreatePage',
})

useHead({ title: 'Create an App' })
</script>
