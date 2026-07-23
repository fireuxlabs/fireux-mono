<template>
  <section class="market-page market-landing" aria-labelledby="buy-title">
    <div class="market-landing__content">
      <p class="market-eyebrow">Interlaken Essen</p>
      <h1 id="buy-title">Choufe</h1>
      <p class="market-intro">
        Lokali Läbensmittel us Interlake und dr Umgäbig.
      </p>

      <nav class="market-actions" aria-label="Witer">
        <NuxtLink to="/Verchoufe" class="market-action market-action--light">
          <UIcon name="i-lucide-circle-plus" aria-hidden="true" />
          <strong>Verchoufe</strong>
          <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
        </NuxtLink>
        <NuxtLink to="/" class="market-action market-action--quiet">
          <UIcon name="i-lucide-arrow-left" aria-hidden="true" />
          <strong>Startsite</strong>
        </NuxtLink>
      </nav>
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
