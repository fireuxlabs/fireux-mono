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
  layout: 'misebox-tenant',
})

useSeoMeta({
  title: 'La Tap Berne | Location',
  description: 'Map and address for La Tap Berne in Matten bei Interlaken.',
})
</script>
