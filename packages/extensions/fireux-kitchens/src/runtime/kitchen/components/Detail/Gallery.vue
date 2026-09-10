<template>
  <PlaceDetailGallery
    v-if="kitchen.food_gallery?.length"
    :name="kitchen.display_name || kitchen.name"
    :images="kitchen.food_gallery"
  />
</template>

<script setup lang="ts">
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.response.ts'
defineProps<{ kitchen: KitchenDetailPresentation }>()
</script>
