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

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  display: grid;
  min-height: 100svh;
  overflow: hidden;
  align-items: end;
  background: var(--aus-forest) url('/img/app/stays/ringgenberg-view.avif')
    center / cover;
  color: var(--aus-white);
}

.hero__veil {
  position: absolute;
  z-index: -1;
  inset: 0;
  background:
    linear-gradient(90deg, rgb(8 34 32 / 78%), rgb(8 34 32 / 5%) 72%),
    linear-gradient(0deg, rgb(8 34 32 / 82%), transparent 56%);
}

.hero__content {
  display: grid;
  gap: calc(var(--spacing) * 5);
  padding: calc(var(--spacing) * 36)
    clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 20))
    calc(var(--spacing) * 28);
}

.hero__content > p,
.eyebrow {
  margin: 0;
  color: var(--aus-sun);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.17em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(4.5rem, 13vw, 11rem);
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.075em;
  line-height: 0.78;
}

.hero__footer {
  display: flex;
  max-width: 58rem;
  align-items: flex-end;
  justify-content: space-between;
  gap: calc(var(--spacing) * 10);
  margin-top: calc(var(--spacing) * 4);
}

.hero__footer span {
  max-width: 34rem;
  color: rgb(255 253 248 / 72%);
  font-size: clamp(1rem, 2vw, 1.35rem);
  line-height: 1.6;
}

.hero__footer a,
.closing a {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 6);
  border-radius: 9999px;
  background: var(--aus-coral);
  color: var(--aus-white);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-extrabold);
  text-decoration: none;
}

.hero__places {
  position: absolute;
  right: clamp(calc(var(--spacing) * 5), 5vw, calc(var(--spacing) * 16));
  bottom: calc(var(--spacing) * 7);
  display: flex;
  gap: calc(var(--spacing) * 4);
}

.hero__places span {
  color: rgb(255 253 248 / 55%);
  font-size: 0.68rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.manifesto {
  display: grid;
  grid-template-columns: minmax(10rem, 0.6fr) minmax(20rem, 1.4fr);
  gap: calc(var(--spacing) * 8);
  padding: clamp(calc(var(--spacing) * 22), 11vw, calc(var(--spacing) * 42))
    clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 20));
}

.manifesto h2,
.featured h2,
.closing h2 {
  max-width: 11ch;
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(3rem, 7vw, 6.5rem);
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.06em;
  line-height: 0.92;
}

.manifesto > div {
  grid-column: 2;
  max-width: 38rem;
  color: var(--aus-muted);
  font-size: 1.15rem;
  line-height: 1.75;
}

.manifesto > div a {
  color: var(--aus-ink);
  font-weight: var(--font-weight-extrabold);
}

.featured {
  padding: 0 clamp(calc(var(--spacing) * 5), 5vw, calc(var(--spacing) * 16))
    clamp(calc(var(--spacing) * 26), 12vw, calc(var(--spacing) * 44));
}

.featured > header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: calc(var(--spacing) * 8);
  margin-bottom: calc(var(--spacing) * 10);
}

.featured > header > div {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.featured > header > a {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  color: var(--aus-ink);
  font-weight: var(--font-weight-extrabold);
}

.featured__grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: calc(var(--spacing) * 6);
}

.featured__grid article {
  position: relative;
  min-height: 26rem;
  overflow: hidden;
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--aus-forest);
}

.featured__card--large {
  grid-row: span 2;
  min-height: 58rem;
}

.featured__grid img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 700ms ease;
}

.featured__grid article:hover img {
  transform: scale(1.035);
}

.featured__grid article > div {
  position: absolute;
  inset: auto 0 0;
  padding: calc(var(--spacing) * 14) calc(var(--spacing) * 7)
    calc(var(--spacing) * 7);
  background: linear-gradient(transparent, rgb(8 34 32 / 88%));
  color: var(--aus-white);
}

.featured__grid span {
  color: var(--aus-sun);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.featured__grid h3 {
  margin: calc(var(--spacing) * 2) 0;
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 4rem);
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.05em;
  line-height: 1;
}

.featured__grid p {
  max-width: 34rem;
  margin: 0 0 calc(var(--spacing) * 4);
  color: rgb(255 253 248 / 70%);
}

.featured__grid a {
  color: var(--aus-white);
  font-weight: var(--font-weight-extrabold);
}

.numbers {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-block: 1px solid var(--aus-line);
}

.numbers article {
  display: grid;
  min-height: 16rem;
  place-content: center;
  text-align: center;
}

.numbers article + article {
  border-left: 1px solid var(--aus-line);
}

.numbers strong {
  color: var(--aus-lake);
  font-family: var(--font-serif);
  font-size: clamp(4rem, 8vw, 7rem);
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.07em;
  line-height: 0.8;
}

.numbers span {
  margin-top: calc(var(--spacing) * 4);
  color: var(--aus-muted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-extrabold);
}

.closing {
  display: grid;
  min-height: 85svh;
  place-items: end start;
  padding: clamp(calc(var(--spacing) * 20), 10vw, calc(var(--spacing) * 36))
    clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 20));
  background:
    linear-gradient(90deg, rgb(12 36 34 / 90%), rgb(12 36 34 / 15%)),
    url('/img/app/stays/alpine-bath.avif') center / cover;
  color: var(--aus-white);
}

.closing > div {
  display: grid;
  max-width: 50rem;
  justify-items: start;
  gap: calc(var(--spacing) * 6);
}

.closing p:not(.eyebrow) {
  max-width: 34rem;
  color: rgb(255 253 248 / 72%);
  font-size: 1.1rem;
  line-height: 1.7;
}

@media (max-width: 52rem) {
  .hero__places {
    display: none;
  }

  .hero__footer,
  .featured > header {
    align-items: flex-start;
    flex-direction: column;
  }

  .manifesto {
    grid-template-columns: 1fr;
  }

  .manifesto > div {
    grid-column: 1;
  }

  .featured__grid {
    grid-template-columns: 1fr;
  }

  .featured__card--large {
    grid-row: auto;
    min-height: 34rem;
  }

  .numbers {
    grid-template-columns: 1fr;
  }

  .numbers article + article {
    border-top: 1px solid var(--aus-line);
    border-left: 0;
  }
}
</style>
