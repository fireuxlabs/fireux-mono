<template>
  <UPage>
    <UPageBody>
      <!-- 01 Detail — the route resolves the Place and passes the canonical record. -->
      <PlaceDetail v-if="place" :place="place" :can-edit="isAdmin" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { usePlaceDetail } from '../../../place/composables/usePlaceDetail'

definePageMeta({
  layout: 'default',
  title: 'Place',
  description: 'View a saved place.',
  head: { title: 'Place' },
})

const routeLocator = useRouteParam('id')
const { place, ready, isAdmin } = usePlaceDetail({
  locator: routeLocator.value,
})
await ready
</script>
