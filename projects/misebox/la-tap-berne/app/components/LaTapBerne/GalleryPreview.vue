<!-- Tenant content-page component: docs/concepts/family-tenant-global.md -->
<template>
  <div class="latap-gallery-preview">
    <img
      :src="src"
      :alt="alt"
    >
  </div>
</template>

<script setup lang="ts">
import { laTapBerneContent } from '../../config/content.config'

withDefaults(defineProps<{
  src?: string
  alt?: string
}>(), {
  src: laTapBerneContent.assets.galleryPreview.src,
  alt: laTapBerneContent.assets.galleryPreview.alt,
})
</script>

<style scoped>
.latap-gallery-preview {
  display: grid;
  gap: 0.9rem;
  width: min(36rem, 100%);
  margin: 0 auto;
}

.latap-gallery-preview img {
  display: block;
  width: 100%;
  border-radius: 1.25rem;
  box-shadow: 0 1rem 3rem color-mix(in srgb, var(--brand-ink) 32%, transparent);
}
</style>
