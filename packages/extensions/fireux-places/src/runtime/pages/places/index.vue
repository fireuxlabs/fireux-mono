<template>
  <UPage>
    <PlaceHero />
    <UPageBody>
      <PlaceCreate />
      <FireState v-bind="page.state" />
      <PlaceCollection
        v-show="page.state.outcome === 'ready' || page.places.length > 0"
        :places="page.places"
      />
      <FireCollectionPagination
        v-if="page.pagination"
        v-bind="page.pagination"
        @load-more="page.loadMore"
      />
      <FireDiagnosticsDebugPanel v-bind="page.diagnostics" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { usePlaceCollectionPage } from '../../place/composables/usePlaceCollectionPage'

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

const page = usePlaceCollectionPage()
</script>
