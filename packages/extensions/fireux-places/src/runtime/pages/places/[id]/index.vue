<template>
  <UPage>
    <UPageBody>
      <PlaceDetail v-if="place" :place="place" />
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
const { place, ready } = usePlaceDetail({
  locator: routeLocator.value,
})
await ready
</script>
