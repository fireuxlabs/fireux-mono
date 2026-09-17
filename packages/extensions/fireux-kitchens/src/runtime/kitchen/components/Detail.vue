<template>
  <article class="place-detail">
    <KitchenDetailHeader :kitchen="presentation" :place="place" />
    <div class="place-detail__layout">
      <div class="place-detail__content">
        <KitchenDetailMenus :kitchen="presentation" :index="menus" />
        <template v-if="focus !== 'menus'">
          <PlaceDetailAbout id="about" class="scroll-mt-24" :place="place" />
          <PlaceDetailGallery
            v-if="place.gallery_images.length"
            :name="place.name"
            :images="place.gallery_images"
          />
        </template>
        <KitchenDetailFulfilment :kitchen="presentation" />
      </div>
      <PlaceDetailVisitInfo class="place-detail__visit" :place="place" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import PlaceDetailAbout from 'fireux-places/runtime/place/components/Detail/About.vue'
import PlaceDetailGallery from 'fireux-places/runtime/place/components/Detail/Gallery.vue'
import PlaceDetailVisitInfo from 'fireux-places/runtime/place/components/Detail/VisitInfo.vue'
import type { KitchenDetailPresentation } from '../models/kitchen-detail.response.ts'
import type { MenuDirectoryController } from '../../menu/composables/useMenuDirectory'
defineProps<{
  place: Place
  presentation: KitchenDetailPresentation
  menus: MenuDirectoryController
  focus?: 'overview' | 'menus'
}>()
</script>

<style scoped src="fireux-places/runtime/place/components/detail.css"></style>
