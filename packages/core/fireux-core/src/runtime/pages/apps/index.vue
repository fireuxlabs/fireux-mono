<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Apps"
      description="Inspect the current app and browse all apps available to this runtime."
    />
    <UPageBody class="space-y-6">
      <OrganismsAppPreview />
      <OrganismsAppCollection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { createError, navigateTo, useHead, useRuntimeConfig } from '#imports'

const role = useRuntimeConfig().public?.role ?? 'tenant'
const showNav = role === 'global'

definePageMeta({
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 40,
    desktop: showNav,
    mobile: showNav,
    layouts: ['default'],
  },
  title: 'Apps',
  description: 'FireUX apps resolved for this runtime.',
  layout: 'default',
  name: 'AppsIndexPage',
})

if (!showNav) {
  if (process.client) {
    navigateTo('/')
  } else {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
}

useHead({ title: 'Apps' })
</script>
