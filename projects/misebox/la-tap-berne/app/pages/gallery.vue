<template>
  <LaTapBernePageSurface
    title="Gallery."
    subtitle="A first look at the terrace, the plate, and the mood."
  >
    <div class="latap-page-gallery">
      <img
        src="/img/gallery/image-1.png"
        alt="La Tap Berne terrace plate"
      >
    </div>
  </LaTapBernePageSurface>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'latap-default',
})

useSeoMeta({
  title: 'La Tap Berne | Gallery',
  description: 'Gallery and social link surface for La Tap Berne.',
})
</script>

<style scoped>
.latap-page-gallery {
  display: grid;
  gap: 0.9rem;
  width: min(36rem, 100%);
  margin: 0 auto;
}

.latap-page-gallery img {
  display: block;
  width: 100%;
  border-radius: 1.25rem;
  box-shadow: 0 1rem 3rem color-mix(in srgb, var(--brand-ink) 32%, transparent);
}
</style>
