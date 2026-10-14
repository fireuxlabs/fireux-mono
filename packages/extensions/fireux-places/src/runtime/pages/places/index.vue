<template>
  <UPage>
    <UPageBody>
      <PlaceHero />
      <PlaceCreate />
      <PlaceCollection :places="places" />
      <CollectionPagination
        :has-more="hasMore"
        :loading="loadingMore"
        @load-more="loadMore"
      />
      <DiagnosticsDebugPanel
        title="Places index acquisition"
        context="Canonical Places and pagination inputs used by the FL index surface."
        object-origin="fetched"
        :objects="{ places }"
        :derived="{ count: places.length, hasMore, loadingMore }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-22 16:08 CEST — Misebox operations shortcuts: expose the canonical Places index to entity discovery.
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePlaceCollection } from '../../place/composables/usePlaceCollection'

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
const pageDescription =
  'Explore venues, locations, and the physical places behind local services.'
useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/places',
})
</script>
