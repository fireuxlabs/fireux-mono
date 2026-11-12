<template>
  <span class="item-photo">
    <img v-if="src" :src="photoImageUrl(src)" :alt="alt" loading="lazy" />
    <UIcon v-else name="i-lucide-sandwich" aria-hidden="true" />
  </span>
</template>

<script setup lang="ts">
import { photoImageUrl } from 'fireux-core/runtime/utils/photo-image-url'
defineProps<{ src?: string; alt: string }>()
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
}
</style>
