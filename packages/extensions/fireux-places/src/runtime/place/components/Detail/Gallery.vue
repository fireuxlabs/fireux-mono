<template>
  <section class="place-gallery" aria-labelledby="place-gallery-title">
    <div class="place-gallery__heading">
      <h2 id="place-gallery-title">In pictures</h2>
      <span
        >{{ images.length }}
        {{ images.length === 1 ? 'photo' : 'photos' }}</span
      >
    </div>
    <div
      class="place-gallery__rail"
      :class="{ 'place-gallery__rail--expanded': expanded }"
    >
      <button
        v-for="(image, index) in images"
        :key="image"
        type="button"
        :aria-label="`View ${name} photo ${index + 1}`"
        @click="openPhoto(image)"
      >
        <div class="place-gallery__fallback" aria-hidden="true">
          <UIcon name="i-lucide-image" />
        </div>
        <img
          :src="image"
          :alt="`${name} gallery image ${index + 1}`"
          loading="lazy"
          decoding="async"
          @error="hideFailedImage"
        />
      </button>
    </div>
    <UButton
      v-if="images.length > 3"
      :label="
        expanded ? 'Collapse gallery' : `View all photos (${images.length})`
      "
      icon="i-lucide-layout-grid"
      color="neutral"
      variant="outline"
      size="sm"
      class="place-gallery__action"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    />
    <UModal
      v-model:open="photoOpen"
      :title="`${name} photos`"
      :ui="{ content: 'sm:max-w-4xl' }"
    >
      <template #body
        ><img
          v-if="selectedImage"
          :src="selectedImage"
          :alt="`${name} gallery photo`"
          class="place-gallery__full-image"
      /></template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'PlaceDetailGallery' })
defineProps<{ name: string; images: string[] }>()
const expanded = ref(false)
const photoOpen = ref(false)
const selectedImage = ref('')
function openPhoto(image: string) {
  selectedImage.value = image
  photoOpen.value = true
}
function hideFailedImage(event: Event) {
  const image = event.currentTarget as HTMLImageElement | null
  if (image) image.hidden = true
}
</script>

<style scoped>
.place-gallery {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
.place-gallery__rail {
  display: grid;
  gap: calc(var(--spacing) * 2);
  grid-auto-columns: min(75vw, 20rem);
  grid-auto-flow: column;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  padding-bottom: calc(var(--spacing) * 2);
  scroll-snap-type: inline mandatory;
  scrollbar-width: thin;
}
.place-gallery__rail button {
  cursor: zoom-in;
  padding: 0;
  aspect-ratio: 4 / 3;
  background: var(--ui-bg-accented);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  margin: 0;
  overflow: hidden;
  position: relative;
  scroll-snap-align: start;
}
.place-gallery__rail img {
  height: 100%;
  object-fit: cover;
  position: relative;
  width: 100%;
  z-index: 1;
}
.place-gallery__fallback {
  color: var(--ui-text-dimmed);
  display: grid;
  inset: 0;
  place-items: center;
  position: absolute;
}
.place-gallery__action {
  justify-self: start;
}
.place-gallery__rail--expanded {
  grid-auto-flow: row;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  overflow: visible;
  scroll-snap-type: none;
}
@media (min-width: 40rem) {
  .place-gallery__rail {
    grid-auto-columns: min(48%, 22rem);
  }
}
.place-gallery__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}
.place-gallery__heading h2 {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--ui-text-highlighted);
  margin: 0;
}
.place-gallery__heading span {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.place-gallery__rail button:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 3px;
}
.place-gallery__full-image {
  display: block;
  max-height: 75vh;
  width: 100%;
  object-fit: contain;
}
</style>
