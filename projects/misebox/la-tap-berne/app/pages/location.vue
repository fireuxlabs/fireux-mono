<template>
  <LaTapBernePageSurface
    title="Find us."
    subtitle="Hauptstrasse 49, 3800 Matten bei Interlaken, Switzerland."
  >
    <div class="latap-page-map">
      <iframe
        title="Map to La Tap Berne"
        src="https://www.google.com/maps?q=La%20Tapberne%20Hauptstrasse%2049%203800%20Matten%20bei%20Interlaken&output=embed"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      />
    </div>

  </LaTapBernePageSurface>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'latap-default',
})

useSeoMeta({
  title: 'La Tap Berne | Location',
  description: 'Map and address for La Tap Berne in Matten bei Interlaken.',
})
</script>

<style scoped>
.latap-page-map {
  overflow: hidden;
  width: min(38rem, 100%);
  aspect-ratio: 16 / 10;
  margin: 0.25rem auto 0;
  border: 1px solid color-mix(in srgb, var(--brand-canvas) 38%, transparent);
  border-radius: 1.25rem;
  box-shadow: 0 1rem 3rem color-mix(in srgb, var(--brand-ink) 32%, transparent);
}

.latap-page-map iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

@media (max-width: 720px) {
  .latap-page-map {
    aspect-ratio: 4 / 3;
  }
}
</style>
