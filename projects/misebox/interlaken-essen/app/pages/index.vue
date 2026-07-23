<template>
  <section class="market-page market-landing" aria-labelledby="market-title">
    <div class="market-landing__content">
      <p class="market-eyebrow">Interlaken &amp; Umgebung</p>
      <h1 id="market-title">
        <span>Interlaken</span>
        <span>Essen</span>
      </h1>
      <p class="market-intro">Dr gratis lokali Marktplatz.</p>

      <MarketLaunchNotice />

      <nav class="market-actions" aria-label="Was möchtsch mache?">
        <NuxtLink to="/choufe" class="market-action market-action--light">
          <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
          <strong>Choufe</strong>
          <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
        </NuxtLink>

        <NuxtLink to="/verchoufe" class="market-action market-action--dark">
          <UIcon name="i-lucide-circle-plus" aria-hidden="true" />
          <strong>Verchoufe</strong>
          <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
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
  title: 'Interlaken Essen',
  description:
    'Lokali Läbensmittel rund um Interlake choufe und verchoufe.',
})
</script>
