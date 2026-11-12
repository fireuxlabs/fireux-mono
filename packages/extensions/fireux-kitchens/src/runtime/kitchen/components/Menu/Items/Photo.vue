<template>
  <span class="item-photo" :class="{ 'item-photo--padded': padded }">
    <img v-if="src" :src="src" :alt="alt" loading="lazy" />
    <UIcon v-else name="i-lucide-sandwich" aria-hidden="true" />
  </span>
</template>
<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ src?: string; alt: string }>()
// The owned Dish upload format reserves 120px per side in a 1200px canvas.
// Crop that known transparent margin in presentation; keep arbitrary URLs intact.
const padded = computed(() => {
  try {
    return /kitchens\/[^/]+\/dishes\/[^/]+\/image\/[^/?]+\.webp/.test(
      decodeURIComponent(props.src || '')
    )
  } catch {
    return false
  }
})
</script>
<style scoped>
.item-photo {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: var(--ui-radius);
}
.item-photo img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  max-width: none;
  max-height: none;
}
.item-photo--padded img {
  inset: -12.5%;
  width: 125%;
  height: 125%;
}
</style>
