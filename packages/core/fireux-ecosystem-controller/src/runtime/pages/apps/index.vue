<template>
  <UPage>
    <UPageHeader
      title="Apps"
      description="Inspect the current app and browse all apps available to this runtime."
    />
    <UPageBody class="pagebody">
      <OrganismsAppCTA />
      <OrganismsAppCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'

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
  tenant: 'global',
  title: 'Apps',
  description: 'FireUX apps resolved for this runtime.',
  layout: 'default',
  name: 'AppsIndexPage',
})

useHead({ title: 'Apps' })
</script>
