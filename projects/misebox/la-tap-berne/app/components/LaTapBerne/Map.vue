<!-- Tenant content-page component: docs/concepts/family-tenant-global.md -->
<template>
  <div class="latap-map">
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
import { laTapBerneContent } from '../../config/content.config'

withDefaults(defineProps<{
  title?: string
  src?: string
}>(), {
  title: `Map to ${laTapBerneContent.brand.name}`,
  src: laTapBerneContent.links.googleMapEmbed,
})
</script>

<style scoped>
.latap-map {
  overflow: hidden;
  width: min(38rem, 100%);
  aspect-ratio: 16 / 10;
  margin: var(--spacing) auto 0;
  border: 1px solid color-mix(in srgb, var(--brand-canvas) 38%, transparent);
  border-radius: calc(var(--ui-radius) * 6);
  box-shadow: 0 1rem 3rem color-mix(in srgb, var(--brand-ink) 32%, transparent);
}

.latap-map iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

@media (max-width: 720px) {
  .latap-map {
    aspect-ratio: 4 / 3;
  }
}
</style>
