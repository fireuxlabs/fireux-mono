<template>
  <CollectionPage
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-truck"
    secondary-label="For drivers"
  >
    <DriverDirectory />

    <template #secondary>
      <!-- Profile CTA family: Driver is a delivery profile attached to a User. -->
      <DriverCurrent />
    </template>
  </CollectionPage>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: Driver public identity and app-private operations.
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

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
  description:
    'Meet delivery professionals keeping kitchens, teams, and orders moving.',
})

const pageTitle = 'Drivers'
const pageDescription =
  'Meet delivery professionals keeping kitchens, teams, and orders moving.'
const { appName } = useFireUXConfig()

useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/drivers',
})
</script>
