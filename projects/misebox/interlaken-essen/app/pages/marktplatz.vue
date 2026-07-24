<template>
  <section
    class="market-page market-directory"
    aria-labelledby="marketplace-title"
  >
    <div class="market-directory__content">
      <header class="market-directory__heading">
        <p class="market-eyebrow">Betrib vo hie</p>
        <h1 id="marketplace-title">Üsi Aabieter</h1>
        <p class="market-intro">
          Entdeck Produzänte, Hofläde, Chäsereie, Imker und Chöch rund um
          Interlake.
        </p>
      </header>

      <div v-if="sellers.length" class="market-seller-grid">
        <article
          v-for="seller in sellers"
          :key="seller.id"
          class="market-seller-card"
        >
          <img :src="seller.image" :alt="seller.imageAlt">
          <div class="market-seller-card__body">
            <span>{{ seller.place }}</span>
            <h2>{{ seller.name }}</h2>
            <p>{{ seller.description }}</p>
          </div>
        </article>
      </div>

      <div v-else class="market-directory__empty">
        <UIcon name="i-lucide-store" aria-hidden="true" />
        <div>
          <h2>Die erschte Aabieter chöme gli.</h2>
          <p>Hesch e lokale Betrieb? Trag di jetzt gratis i.</p>
        </div>
        <NuxtLink to="/auth" class="market-action market-action--light">
          <UIcon name="i-lucide-circle-plus" aria-hidden="true" />
          <strong>Betrib registriere</strong>
          <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type MarketSeller = {
  id: string
  name: string
  place: string
  description: string
  image: string
  imageAlt: string
}

const sellers: MarketSeller[] = []

definePageMeta({
  layout: 'marketplace',
})

useSeoMeta({
  title: 'Marktplatz – Interlaken Essen',
  description:
    'Lokali Produzänte, Hofläde, Chäsereie, Imker und Chöch rund um Interlake entdecke.',
})
</script>
