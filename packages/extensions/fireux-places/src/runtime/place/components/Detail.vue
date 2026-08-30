<template>
  <article class="space-y-8">
    <PlaceHeader :place="place" />
    <PlaceDetailContent :place="place" />
    <PlaceDetailAdmin :place="place" />
  </article>
</template>

<script setup lang="ts">
import type { Place } from '../models/place.model.ts'
defineOptions({ name: 'PlaceDetail' })
defineProps<{ place: Place }>()
</script>
