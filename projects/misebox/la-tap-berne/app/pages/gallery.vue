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
  layout: 'misebox-tenant',
})

useSeoMeta({
  title: 'La Tap Berne | Gallery',
  description: 'Gallery and social link surface for La Tap Berne.',
})
</script>
