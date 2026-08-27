<template>
  <CollectionPage
    eyebrow="Discover"
    :title="pageTitle"
    description="Explore venues, locations, and the physical places behind local services."
    icon="i-lucide-map-pin"
    secondary-label="For place operators"
  >
    <PlaceCollectionManager />

    <template #secondary>
      <PlaceCTA />
    </template>
  </CollectionPage>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-22 16:08 CEST — Misebox operations shortcuts: expose the canonical Places index to entity discovery.
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

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
