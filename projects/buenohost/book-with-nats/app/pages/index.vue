<template>
  <div class="home">
    <section class="hero" :style="{ '--hero-image': `url(${property.image})` }">
      <div class="hero__shade" />
      <div class="hero__content">
        <p>{{ property.eyebrow }}</p>
        <h1>Come stay<br />with Nats.</h1>
        <div class="hero__bottom">
          <span>{{ property.summary }}</span>
          <NuxtLink to="/book">
            Check your dates
            <UIcon name="i-lucide-arrow-right" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="intro">
      <p class="intro__eyebrow">Four apartments · hosted personally</p>
      <h2>A simple place to land, look out and feel at home.</h2>
      <div class="intro__copy">
        <p>
          Choose a central base near Interlaken or a slower escape above Lugano.
          Every stay comes with a direct line to Nats.
        </p>
        <NuxtLink to="/stay">Explore the apartment</NuxtLink>
      </div>
    </section>

    <section class="collection" aria-labelledby="collection-title">
      <div class="collection__heading">
        <p>Find your stay</p>
        <h2 id="collection-title">Four places, one thoughtful host.</h2>
      </div>
      <div class="collection__grid">
        <article v-for="stay in bookWithNatsContent.properties" :key="stay.id">
          <img :src="stay.image" :alt="stay.imageAlt" />
          <div>
            <span>{{ stay.location }}</span>
            <h3>{{ stay.name }}</h3>
            <p>{{ stay.summary }}</p>
            <NuxtLink :to="`/stay#${stay.id}`">View this stay</NuxtLink>
          </div>
        </article>
      </div>
    </section>

    <section class="facts" aria-label="Apartment facts">
      <article v-for="fact in facts" :key="fact.label">
        <UIcon :name="fact.icon" />
        <strong>{{ fact.value }}</strong>
        <span>{{ fact.label }}</span>
      </article>
    </section>

    <section class="host-note">
      <p>From Nats</p>
      <blockquote>
        “Tell me what would make the trip special. I’ll help with the stay, the
        details and a few local favourites.”
      </blockquote>
      <NuxtLink to="/contact">Say hello</NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  bookWithNatsContent,
  primaryNatsProperty as property,
} from '../config/content.config'

definePageMeta({
  layout: 'nats-default',
})

const facts = [
  { label: 'apartments', value: 4, icon: 'i-lucide-house' },
  { label: 'Swiss regions', value: 2, icon: 'i-lucide-mountain-snow' },
  { label: 'personal host', value: 1, icon: 'i-lucide-heart-handshake' },
] as const

useSeoMeta({
  title: 'Book with Nats | A private Swiss alpine stay',
  description: property.summary,
  ogImage: property.image,
})
</script>

<style scoped>
.home {
  background: var(--nats-canvas);
}

.hero {
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  background: var(--nats-forest) var(--hero-image) center / cover no-repeat;
  color: var(--nats-on-dark);
}

.hero__shade {
  position: absolute;
  z-index: -1;
  inset: 0;
  background:
    linear-gradient(90deg, rgb(15 19 15 / 75%), rgb(15 19 15 / 6%) 70%),
    linear-gradient(0deg, rgb(15 19 15 / 70%), transparent 52%);
}

.hero__content {
  display: flex;
  min-height: 100svh;
  flex-direction: column;
  justify-content: flex-end;
  gap: 1.2rem;
  padding: calc(var(--spacing) * 32)
    clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 24))
    clamp(calc(var(--spacing) * 30), 12vw, calc(var(--spacing) * 36));
}

.hero__content > p {
  margin: 0;
  color: var(--nats-gold);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(calc(var(--spacing) * 16), 12vw, 9.5rem);
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.07em;
  line-height: 0.82;
}

.hero__bottom {
  display: flex;
  max-width: 58rem;
  align-items: flex-end;
  justify-content: space-between;
  gap: calc(var(--spacing) * 8);
  margin-top: calc(var(--spacing) * 4);
}

.hero__bottom span {
  max-width: 34rem;
  color: rgb(255 250 240 / 76%);
  font-size: clamp(calc(var(--spacing) * 4), 2vw, 1.2rem);
  line-height: 1.6;
}

.hero__bottom a,
.host-note a {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 1.1rem;
  border-radius: 9999px;
  background: var(--nats-rust);
  color: white;
  font-size: 0.82rem;
  font-weight: var(--font-weight-extrabold);
  text-decoration: none;
}

.intro {
  display: grid;
  grid-template-columns: minmax(calc(var(--spacing) * 40), 0.7fr) minmax(
      18rem,
      1.8fr
    );
  gap: calc(var(--spacing) * 8);
  padding: clamp(calc(var(--spacing) * 20), 10vw, calc(var(--spacing) * 40))
    clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 24));
}

.intro__eyebrow,
.host-note > p {
  color: var(--nats-rust);
  font-size: 0.72rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.intro h2 {
  max-width: 14ch;
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2.6rem, 6vw, 5.5rem);
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.055em;
  line-height: 0.98;
}

.intro__copy {
  grid-column: 2;
  max-width: 35rem;
  color: var(--nats-muted);
  font-size: 1.05rem;
  line-height: 1.7;
}

.intro__copy a {
  color: var(--nats-ink);
  font-weight: var(--font-weight-extrabold);
}

.facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 0 clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 24))
    clamp(calc(var(--spacing) * 20), 10vw, calc(var(--spacing) * 36));
  border-block: 1px solid var(--nats-line);
}

.collection {
  padding: calc(var(--spacing) * 4)
    clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 24))
    clamp(calc(var(--spacing) * 24), 11vw, calc(var(--spacing) * 40));
}

.collection__heading {
  display: grid;
  grid-template-columns: 0.7fr 1.8fr;
  gap: calc(var(--spacing) * 8);
  margin-bottom: calc(var(--spacing) * 12);
}

.collection__heading p {
  color: var(--nats-rust);
  font-size: 0.72rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.collection__heading h2 {
  max-width: 12ch;
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2.8rem, 6vw, 5.5rem);
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.055em;
  line-height: 0.98;
}

.collection__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(calc(var(--spacing) * 5), 3vw, calc(var(--spacing) * 10));
}

.collection article {
  overflow: hidden;
  background: var(--nats-paper);
}

.collection article img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.collection article > div {
  display: grid;
  justify-items: start;
  gap: 0.7rem;
  padding: calc(var(--spacing) * 6);
}

.collection article span {
  color: var(--nats-rust);
  font-size: 0.68rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.collection article h3 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 3vw, calc(var(--spacing) * 10));
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.04em;
}

.collection article p {
  margin: 0;
  color: var(--nats-muted);
  line-height: 1.6;
}

.collection article a {
  color: var(--nats-ink);
  font-size: 0.82rem;
  font-weight: var(--font-weight-extrabold);
}

.facts article {
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  padding: calc(var(--spacing) * 10) calc(var(--spacing) * 4);
  border-right: 1px solid var(--nats-line);
}

.facts article:last-child {
  border-right: 0;
}

.facts strong {
  font-family: var(--font-serif);
  font-size: 2.4rem;
  font-weight: var(--font-weight-normal);
}

.facts span {
  color: var(--nats-muted);
  font-size: var(--text-xs);
  text-transform: uppercase;
}

.host-note {
  display: grid;
  justify-items: start;
  gap: calc(var(--spacing) * 6);
  padding: clamp(calc(var(--spacing) * 20), 10vw, calc(var(--spacing) * 36))
    clamp(calc(var(--spacing) * 5), 10vw, calc(var(--spacing) * 40));
  background: var(--nats-forest);
  color: var(--nats-on-dark);
}

.host-note blockquote {
  max-width: 20ch;
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2.2rem, 5vw, 4.7rem);
  letter-spacing: -0.045em;
  line-height: 1.05;
}

@media (max-width: 44rem) {
  .hero__bottom,
  .intro {
    display: grid;
    grid-template-columns: 1fr;
  }

  .hero__bottom {
    align-items: start;
  }

  .hero__bottom a {
    justify-self: start;
  }

  .intro__copy {
    grid-column: 1;
  }

  .collection__heading,
  .collection__grid {
    grid-template-columns: 1fr;
  }
}
</style>
