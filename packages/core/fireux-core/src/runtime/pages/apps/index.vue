<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody>
      <AppCTA />
      <AppCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'

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
  description: 'Browse apps for the current ecosystem.',
  layout: 'default',
  name: 'AppsIndexPage',
})

const { appName } = useFireUXConfig()

const pageTitle = 'Apps'
const pageDescription = 'Browse apps for the current ecosystem.'

useHead({ title: `${appName} | ${pageTitle}` })
</script>
