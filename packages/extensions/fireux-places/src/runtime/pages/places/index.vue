<template>
  <main class="mx-auto grid w-full max-w-7xl gap-12 px-4 py-10">
    <PlaceHero />
    <PlaceCreate />
    <PlaceCollection
      :places="places"
      :has-more="hasMore"
      :loading-more="loadingMore"
      :load-more="loadMore"
    />
  </main>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-22 16:08 CEST — Misebox operations shortcuts: expose the canonical Places index to entity discovery.
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { usePlaceCollection } from '../../place/composables/firestore/fetch/usePlaceCollection'

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
const {
  collection: places,
  hasMore,
  loadingMore,
  loadMore,
} = usePlaceCollection()

const pageTitle = 'Places'
useHead({ title: `${appName} | ${pageTitle}` })
</script>
