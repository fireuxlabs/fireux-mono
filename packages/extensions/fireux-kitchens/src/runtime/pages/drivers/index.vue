<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody>
      <!-- Profile CTA family: Driver is a delivery profile attached to a User. -->
      <DriverCTA />

      <DriverCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: Driver public identity and app-private operations.
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  tag: 'drivers',
  nav: {
    visibility: { profiles: ['driver'] },
    key: 'drivers',
    label: 'Drivers',
    icon: 'i-lucide-car',
    order: 43,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  layout: 'default',
  name: 'DriversIndexPage',
  title: 'Drivers',
  description: 'Browse driver profiles.',
})

const pageTitle = 'Drivers'
const pageDescription = 'Find drivers, or create your delivery profile.'
const { appName } = useFireUXConfig()

useHead({ title: `${appName} | ${pageTitle}` })
</script>
