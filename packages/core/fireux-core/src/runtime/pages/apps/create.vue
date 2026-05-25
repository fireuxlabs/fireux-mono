<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Initialize App"
      description="Bootstrap or restore the current app record from runtime config and re-run onboarding safely."
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
  tenant: 'global',
  title: 'Initialize App',
  description: 'Create or repair the current app record safely from runtime config.',
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

useHead({ title: 'Initialize App' })
</script>
