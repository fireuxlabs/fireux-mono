<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody>
      <BusinessCollectionManager />
      <BusinessCTA />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

definePageMeta({
  layout: 'default',
  title: 'Businesses',
  description: 'Browse businesses.',
  nav: {
    key: 'businesses',
    label: 'Businesses',
    icon: 'i-lucide-building-2',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  name: 'BusinessesIndexPage',
})

const pageTitle = 'Businesses'
const pageDescription = 'Browse businesses and their business profiles.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
