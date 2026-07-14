<!-- Tenant content-page component: docs/concepts/family-tenant-global.md -->
<template>
  <div class="baeren-map">
    <iframe
      :title="title"
      :src="src"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts"
      credentialless
    />
  </div>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../../config/content.config'

withDefaults(defineProps<{
  title?: string
  src?: string
}>(), {
  title: `Map to ${baerenRinggenbergContent.brand.name}`,
  src: baerenRinggenbergContent.links.googleMapEmbed,
})
</script>

<style scoped>
.baeren-map {
  overflow: hidden;
  width: min(38rem, 100%);
  aspect-ratio: 16 / 10;
  margin: 0.25rem auto 0;
  border: 1px solid color-mix(in srgb, var(--brand-canvas) 38%, transparent);
  border-radius: 1.25rem;
  box-shadow: 0 1rem 3rem color-mix(in srgb, var(--brand-ink) 32%, transparent);
}

.baeren-map iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

@media (max-width: 720px) {
  .baeren-map {
    aspect-ratio: 4 / 3;
  }
}
</style>
