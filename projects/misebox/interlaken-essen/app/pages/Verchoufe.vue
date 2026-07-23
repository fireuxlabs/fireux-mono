<template>
  <section class="market-page market-landing" aria-labelledby="sell-title">
    <div class="market-landing__content">
      <p class="market-eyebrow">Interlaken Essen</p>
      <h1 id="sell-title">Verchoufe</h1>
      <p class="market-intro">
        Dis lokale Ässe für Lüt us dr Region.
      </p>

      <nav class="market-actions" aria-label="Witer">
        <NuxtLink to="/choufe" class="market-action market-action--light">
          <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
          <strong>Choufe</strong>
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
  title: 'Verchoufe – Interlaken Essen',
  description:
    'Biet dini lokale Läbensmittel für Lüt rund um Interlake aa.',
})
</script>
