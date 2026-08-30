<template>
  <UPage>
    <UPageBody>
      <PlaceDetail v-if="place" :place="place" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { usePlaceDetail } from 'fireux-places/runtime/place/composables/usePlaceDetail'

const { place, ready } = usePlaceDetail('ChIJ08WSgYSjj0cRD6oE3RwUFk0')
await ready

definePageMeta({
  layout: 'default',
  title: 'La Tap Berne',
  description: 'Public place information for La Tap Berne.',
  name: 'LaTapBernePlacePage',
})

useSeoMeta({
  title: 'La Tap Berne | Place',
  description:
    'Public place information, location, and links for La Tap Berne.',
})
</script>
