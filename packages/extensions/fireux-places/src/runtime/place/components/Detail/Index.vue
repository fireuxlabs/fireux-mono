<template>
  <article class="place-detail">
    <slot name="edit-actions" />
    <slot name="header"><PlaceDetailHeader :place="place" /></slot>
    <div class="place-detail__layout">
      <div class="place-detail__content">
        <slot name="services" />
        <PlaceDetailAbout id="about" :place="place" />
        <PlaceDetailGallery
          v-if="place.gallery_images.length"
          :name="place.name"
          :images="place.gallery_images"
        />
        <PlaceDetailContact :place="place" />
        <slot name="after-content" />
      </div>
      <PlaceDetailVisitInfo class="place-detail__visit" :place="place" />
    </div>
    <slot v-if="showManagement" name="management"
      ><PlaceDetailAdmin :place="place"
    /></slot>
  </article>
</template>

<script setup lang="ts">
import type { Place } from '../../models/place.model.ts'
defineOptions({ name: 'PlaceDetail' })
withDefaults(defineProps<{ place: Place; showManagement?: boolean }>(), {
  showManagement: true,
})
</script>

<style scoped>
.place-detail {
  display: grid;
  gap: 2rem;
}
.place-detail__layout {
  display: grid;
  gap: 3rem;
  align-items: start;
  padding-top: 0.5rem;
}
.place-detail__content {
  display: grid;
  gap: 3rem;
  min-width: 0;
}
@media (min-width: 64rem) {
  .place-detail__layout {
    grid-template-columns: minmax(0, 1fr) 21rem;
    gap: clamp(2rem, 5vw, 5rem);
  }
  .place-detail__visit {
    position: sticky;
    top: 6rem;
  }
}
</style>
