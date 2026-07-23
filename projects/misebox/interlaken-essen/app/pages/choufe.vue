<template>
  <section class="market-page market-landing" aria-labelledby="buy-title">
    <div class="market-landing__content">
      <ChoufeMain id="buy-title" />
      <MarketplaceShared />
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'marketplace',
})

useSeoMeta({
  title: 'Choufe – Interlaken Essen',
  description:
    'Lokali Läbensmittel vo Lüt, Produzänte und chline Betrib rund um Interlake entdecke.',
})
</script>
