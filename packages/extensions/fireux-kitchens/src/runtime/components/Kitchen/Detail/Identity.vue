<template>
  <UCard v-if="hasSurface">
    <div class="space-y-3">
      <div
        v-if="heroImage"
        class="overflow-hidden rounded-xl bg-elevated"
      >
        <img
          :src="heroImage"
          :alt="imageAlt"
          class="h-full min-h-44 w-full object-cover"
        >
      </div>

      <div v-if="foodGallery.length" class="flex gap-2 overflow-x-auto pb-1">
        <img
          v-for="image in foodGallery"
          :key="image"
          :src="image"
          :alt="imageAlt"
          class="size-20 shrink-0 rounded-lg object-cover"
        >
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = defineProps<{
  kitchen: KitchenSurface | null
}>()

const clean = (value: unknown) => String(value ?? '').trim()
const title = computed(() => clean(props.kitchen?.display_name))
const heroImage = computed(() => clean(props.kitchen?.display_image_url))
const foodGallery = computed(() =>
  Array.isArray(props.kitchen?.food_gallery)
    ? props.kitchen.food_gallery.map(clean).filter(Boolean)
    : []
)
const imageAlt = computed(() =>
  title.value ? `${title.value} food image` : 'Kitchen food image'
)
const hasSurface = computed(() =>
  Boolean(heroImage.value || foodGallery.value.length)
)
</script>
