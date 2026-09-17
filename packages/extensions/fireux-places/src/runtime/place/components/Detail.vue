<template>
  <article class="place-detail">
    <slot name="edit-actions" />
    <PlaceHeader :place="place" />
    <slot v-if="showManagement" name="management"
      ><PlaceDetailAdmin :place="place"
    /></slot>
    <div class="place-detail__layout">
      <div class="place-detail__content">
        <slot name="services" />
        <PlaceDetailAbout :place="place" />
        <PlaceDetailGallery
          v-if="place.gallery_images.length"
          :name="place.name"
          :images="place.gallery_images"
        />
      </div>
      <PlaceDetailVisitInfo class="place-detail__visit" :place="place" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Place } from '../models/place.model.ts'
defineOptions({ name: 'PlaceDetail' })
withDefaults(defineProps<{ place: Place; showManagement?: boolean }>(), {
  showManagement: true,
})
</script>

<style scoped src="./detail.css"></style>
