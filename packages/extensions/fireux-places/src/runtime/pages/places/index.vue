<template>
  <UPage>
    <UPageHeader
      :title="pageTitle"
      description="Browse saved venues and locations."
    />

    <UPageBody>
      <PlaceCTA />

      <PlaceCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-22 16:08 CEST — Misebox operations shortcuts: expose the canonical Places index to entity discovery.
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'default',
  title: 'Places',
  description: 'Saved places.',
  tag: 'places',
  nav: {
    key: 'places',
    label: 'Places',
    icon: 'i-lucide-map-pin',
    order: 25,
    desktop: false,
    mobile: false,
    layouts: ['default', 'landing'],
  },
  name: 'PlacesIndexPage',
})

const { appName } = useFireUXConfig()

const pageTitle = 'Places'
useHead({ title: `${appName} | ${pageTitle}` })
</script>
