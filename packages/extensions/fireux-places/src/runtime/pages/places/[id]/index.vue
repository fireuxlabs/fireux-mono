<template>
  <UPage>
    <UPageBody>
      <PlaceDetail v-if="place" :place="place" />
      <DevDebugPanel
        title="Place detail acquisition"
        context="Canonical Place fetched by the detail route."
        object-origin="fetched"
        :objects="{ place }"
        :derived="{ routeLocator }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { usePlaceDetail } from '../../../place/composables/usePlaceDetail'

definePageMeta({
  layout: 'default',
  title: 'Place',
  description: 'View Place details.',
})

const routeLocator = useRouteParam('id')
const { place, ready } = usePlaceDetail(routeLocator)
await ready
</script>
