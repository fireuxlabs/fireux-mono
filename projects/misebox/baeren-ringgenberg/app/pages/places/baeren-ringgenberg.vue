<template>
  <UPage>
    <UPageBody>
      <PlaceDetail v-if="place" :place="place" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { usePlaceDetail } from 'fireux-places/runtime/place/composables/usePlaceDetail'

const { place, ready } = usePlaceDetail({
  locator: 'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
})
await ready

definePageMeta({
  layout: 'default',
  title: 'Hotel Bären Ringgenberg',
  description: 'Public place information for Hotel Bären Ringgenberg.',
  name: 'BaerenRinggenbergPlacePage',
})

useSeoMeta({
  title: 'Hotel Bären Ringgenberg | Place',
  description:
    'Public place information, location, and links for Hotel Bären Ringgenberg.',
})
</script>
