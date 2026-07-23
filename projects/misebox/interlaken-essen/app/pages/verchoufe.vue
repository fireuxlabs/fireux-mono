<template>
  <section
    id="betrieb-registriere"
    class="market-page market-landing market-browse"
    aria-labelledby="sell-title"
  >
    <div class="market-landing__content">
      <VerchoufeMain id="sell-title" />
      <MarketplaceShared />
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'marketplace',
})

useSeoMeta({
  title: 'Verchoufe – Interlaken Essen',
  description:
    'Biet dini lokale Läbensmittel für Lüt rund um Interlake aa.',
})
</script>
