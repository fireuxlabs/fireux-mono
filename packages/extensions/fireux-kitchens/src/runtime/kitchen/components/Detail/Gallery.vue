<template>
  <PlaceDetailGallery
    v-if="images.length"
    :name="kitchen.display_name || kitchen.name"
    :images="images"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.response.ts'
const props = defineProps<{ kitchen: KitchenDetailPresentation }>()
const images = computed(() =>
  [...new Set(props.kitchen.food_gallery || [])].filter(
    (url) => url !== props.kitchen.cover_image
  )
)
</script>
