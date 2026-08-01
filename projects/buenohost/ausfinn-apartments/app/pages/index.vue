<template>
  <div class="home">
    <section class="hero">
      <div class="hero__veil" />
      <div class="hero__content">
        <p>Holiday homes around Interlaken</p>
        <h1>Stay close<br />to wonder.</h1>
        <div class="hero__footer">
          <span>
            Apartments, houses and an alpine villa between the lakes and
            mountains.
          </span>
          <NuxtLink to="/stays">
            Find your place
            <UIcon name="i-lucide-arrow-down-right" />
          </NuxtLink>
        </div>
      </div>
      <div class="hero__places">
        <span v-for="location in ausfinnContent.locations" :key="location">
          {{ location }}
        </span>
      </div>
    </section>

    <section class="manifesto">
      <p class="eyebrow">More than somewhere to sleep</p>
      <h2>Room for the whole story.</h2>
      <div>
        <p>
          Come as a couple, a family, or bring the whole gang. AUSFinn’s
          collection ranges from intimate studios to a five-bedroom alpine
          house, all within easy reach of the Bernese Oberland.
        </p>
        <NuxtLink to="/contact">Meet the AUSFinn team</NuxtLink>
      </div>
    </section>

    <section class="featured" aria-labelledby="featured-title">
      <header>
        <div>
          <p class="eyebrow">A few favourites</p>
          <h2 id="featured-title">Pick your pace.</h2>
        </div>
        <NuxtLink to="/stays">
          See all stays
          <UIcon name="i-lucide-arrow-up-right" />
        </NuxtLink>
      </header>

      <div class="featured__grid">
        <article
          v-for="(stay, index) in featuredAusfinnStays"
          :key="stay.id"
          :class="{ 'featured__card--large': index === 0 }"
        >
          <img :src="stay.image" :alt="stay.imageAlt" />
          <div>
            <span>{{ stay.type }} · {{ stay.location }}</span>
            <h3>{{ stay.name }}</h3>
            <p>{{ stay.summary }}</p>
            <NuxtLink :to="`/stays#${stay.id}`">Take a look</NuxtLink>
          </div>
        </article>
      </div>
    </section>

    <section class="numbers" aria-label="AUSFinn at a glance">
      <article>
        <strong>10</strong>
        <span>stays and growing</span>
      </article>
      <article>
        <strong>4</strong>
        <span>beautiful villages</span>
      </article>
      <article>
        <strong>1</strong>
        <span>local team to call</span>
      </article>
    </section>

    <section class="closing">
      <div>
        <p class="eyebrow">The alpine guest house</p>
        <h2>Two hundred and fifty years young.</h2>
        <p>
          Original stone, warm timber, five bedrooms and the kind of view that
          makes breakfast last longer.
        </p>
        <NuxtLink to="/book?stay=alpine-guest-house"
          >Ask about the villa</NuxtLink
        >
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ausfinnContent, featuredAusfinnStays } from '../config/content.config'

definePageMeta({ layout: 'ausfinn-default' })

useSeoMeta({
  title: 'AUSFinn Apartments | Stay close to wonder',
  description:
    'Apartments, houses and an alpine villa around Interlaken, Unterseen, Ringgenberg and Bönigen.',
  ogImage: '/img/app/stays/ringgenberg-view.avif',
})
</script>

<style scoped src="./ausfinn-home.css"></style>
