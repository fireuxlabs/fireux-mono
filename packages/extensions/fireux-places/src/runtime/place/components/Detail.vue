<template>
  <article class="space-y-8">
    <PlaceHeader :place="place" />
    <PlaceDetailAbout :place="place" />
    <PlaceDetailGallery
      v-if="place.gallery_images.length"
      :name="place.name"
      :images="place.gallery_images"
    />
    <PlaceDetailVisitInfo :place="place" />
    <PlaceDetailAdmin :place="place" />
  </article>
</template>

<script setup lang="ts">
import type { Place } from '../models/place.model.ts'
defineOptions({ name: 'PlaceDetail' })
defineProps<{ place: Place }>()
</script>
