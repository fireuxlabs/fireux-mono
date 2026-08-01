<template>
  <main class="yv-home">
    <section class="yv-home-hero">
      <div class="yv-home-hero__media">
        <img
          src="/img/yellow-velo/hero.png"
          alt="Yellow Velo bicycle showroom in Interlaken"
        >
      </div>

      <div class="yv-home-hero__copy">
        <p class="yv-kicker">Independent bike shop · Interlaken</p>
        <h1 aria-label="Ride something different.">
          Ride<br>
          something<br>
          <em>different.</em>
        </h1>
        <p class="yv-home-hero__intro">
          Vintage steel, modern adventure bikes, rare components and excellent
          things to wear on and off the bike.
        </p>
        <div class="yv-home-hero__actions">
          <NuxtLink to="/products" class="yv-cta yv-cta--dark">
            Enter the shop
            <UIcon name="i-lucide-arrow-right" />
          </NuxtLink>
          <NuxtLink to="/products?category=Bicycles" class="yv-text-link">
            See the bicycles
          </NuxtLink>
        </div>
      </div>

      <p class="yv-home-hero__side">
        46.6863° N · 7.8632° E
      </p>
    </section>

    <div class="yv-ticker" aria-hidden="true">
      <div>
        <span>Vintage bikes</span><i>✦</i>
        <span>Fresh builds</span><i>✦</i>
        <span>Rare parts</span><i>✦</i>
        <span>Good apparel</span><i>✦</i>
        <span>Interlaken rides</span><i>✦</i>
      </div>
    </div>

    <section class="yv-intro">
      <p class="yv-section-number">01 / The shop</p>
      <div>
        <h2>A bike shop for people who actually like bikes.</h2>
        <p>
          Not endless aisles of sameness. Yellow Velo brings together soulful
          bicycles, workshop-worthy components and riding goods chosen with a
          point of view.
        </p>
      </div>
    </section>

    <section class="yv-featured">
      <header>
        <div>
          <p class="yv-section-number">02 / Fresh in</p>
          <h2>Worth a closer look.</h2>
        </div>
        <NuxtLink to="/products" class="yv-text-link">
          Shop all {{ products.length || 94 }} pieces
        </NuxtLink>
      </header>

      <div v-if="featuredProducts.length" class="yv-featured__grid">
        <NuxtLink
          v-for="(product, index) in featuredProducts"
          :key="product.id"
          :to="`/products/${product.slug}`"
          class="yv-feature"
          :class="{ 'yv-feature--hero': index === 0 }"
        >
          <div class="yv-feature__image">
            <img :src="product.main_image" :alt="product.name">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
          </div>
          <div class="yv-feature__meta">
            <div>
              <p>{{ primaryCategory(product) }}</p>
              <h3>{{ product.name }}</h3>
            </div>
            <strong>{{ formatPrice(product) }}</strong>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="yv-featured__loading" aria-label="Loading featured products">
        <div v-for="index in 3" :key="index" />
      </div>
    </section>

    <section class="yv-categories">
      <NuxtLink to="/products?category=Bicycles" class="yv-category yv-category--bikes">
        <span>01</span>
        <div>
          <p>Built, restored, ready</p>
          <h2>Bicycles</h2>
        </div>
        <UIcon name="i-lucide-arrow-up-right" />
      </NuxtLink>
      <NuxtLink to="/products?category=Components" class="yv-category">
        <span>02</span>
        <div>
          <p>Old stock, new favourites</p>
          <h2>Parts</h2>
        </div>
        <UIcon name="i-lucide-arrow-up-right" />
      </NuxtLink>
      <NuxtLink to="/products?category=Apparel" class="yv-category yv-category--yellow">
        <span>03</span>
        <div>
          <p>On the bike, off the bike</p>
          <h2>Apparel</h2>
        </div>
        <UIcon name="i-lucide-arrow-up-right" />
      </NuxtLink>
    </section>

    <section class="yv-manifesto">
      <img
        src="/img/yellow-velo/hero.png"
        alt="Inside the Yellow Velo workshop"
      >
      <div>
        <p class="yv-section-number">03 / Interlaken</p>
        <blockquote>
          “The best bike is the one that makes you take the long way home.”
        </blockquote>
        <p>
          We rent, tour, restore, build and ride. Drop in before the pass,
          after the trail, or whenever a beautiful old frame catches your eye.
        </p>
        <a
          href="https://www.instagram.com/yellow.velo.interlaken/"
          target="_blank"
          rel="noreferrer"
          class="yv-cta yv-cta--light"
        >
          Follow the ride
          <UIcon name="i-lucide-instagram" />
        </a>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductCollection } from 'fireux-products/runtime/composables/fireux/firestore/product/fetch/useProductCollection'
import type { FirebaseProduct } from 'fireux-products/runtime/models/product.model'

const description =
  'Independent bike shop in Interlaken for vintage bicycles, adventure builds, rare components and considered cycling goods.'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Yellow Velo · Independent bike shop in Interlaken',
  ogTitle: 'Yellow Velo · Independent bike shop in Interlaken',
  twitterTitle: 'Yellow Velo · Independent bike shop in Interlaken',
  description,
  ogDescription: description,
  twitterDescription: description,
})

const fetched = useProductCollection()
const products = computed(() => fetched.products.value ?? [])
const featuredProducts = computed(() => {
  const bikes = products.value.filter(product =>
    productCategories(product).includes('Bicycles')
  )
  const apparel = products.value.find(product =>
    productCategories(product).includes('Apparel')
  )
  return [...bikes.slice(0, 2), ...(apparel ? [apparel] : [])].slice(0, 3)
})

const productCategories = (product: FirebaseProduct) => {
  const metadata = product.metadata as { categories?: unknown } | undefined
  return Array.isArray(metadata?.categories)
    ? metadata.categories.map(value => String(value))
    : []
}

const primaryCategory = (product: FirebaseProduct) =>
  productCategories(product)[0] || 'Yellow Velo'

const formatPrice = (product: FirebaseProduct) => {
  const amount = Number(product.default_price?.unit_amount ?? 0)
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: String(product.prices?.[0]?.currency || 'CHF').toUpperCase(),
    maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100)
}
</script>

<style scoped>
.yv-home {
  --ink: #11110f;
  --paper: #f2f0e8;
  --yellow: #e7d90b;
  background: var(--paper);
  color: var(--ink);
  overflow-x: clip;
}

.yv-home-hero {
  position: relative;
  display: grid;
  grid-template-columns: 1.12fr .88fr;
  min-height: calc(100svh - 5.75rem);
  border-bottom: 1px solid var(--ink);
}

.yv-home-hero__media {
  min-height: 44rem;
  overflow: hidden;
  background: #c9c3b0;
}

.yv-home-hero__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(.72) contrast(1.08);
  transition: transform 1.2s cubic-bezier(.2,.8,.2,1);
}

.yv-home-hero:hover .yv-home-hero__media img {
  transform: scale(1.025);
}

.yv-home-hero__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  padding: clamp(calc(var(--spacing) * 12), 7vw, calc(var(--spacing) * 30)) clamp(calc(var(--spacing) * 6), 5vw, calc(var(--spacing) * 22));
  background: var(--yellow);
}

.yv-kicker,
.yv-section-number {
  margin: 0;
  font-size: .68rem;
  font-weight: var(--font-weight-black);
  letter-spacing: .18em;
  text-transform: uppercase;
}

.yv-home-hero h1 {
  margin: clamp(calc(var(--spacing) * 8), 5vh, calc(var(--spacing) * 18)) 0 calc(var(--spacing) * 10);
  font-size: clamp(4rem, 6vw, 8rem);
  font-weight: var(--font-weight-black);
  letter-spacing: -.075em;
  line-height: .75;
  text-transform: uppercase;
}

.yv-home-hero h1 em {
  font-family: var(--font-serif);
  font-size: .78em;
  font-weight: 400;
  letter-spacing: -.055em;
  text-transform: none;
}

.yv-home-hero__intro {
  max-width: 33rem;
  margin: 0;
  font-size: clamp(1rem, 1.5vw, 1.3rem);
  font-weight: 650;
  line-height: 1.6;
}

.yv-home-hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 6);
  margin-top: calc(var(--spacing) * 12);
}

.yv-cta {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  min-width: 13rem;
  gap: calc(var(--spacing) * 8);
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 4.6);
  border: 1px solid currentColor;
  font-size: .72rem;
  font-weight: var(--font-weight-black);
  letter-spacing: .12em;
  text-decoration: none;
  text-transform: uppercase;
  transition: transform .2s ease, box-shadow .2s ease;
}

.yv-cta:hover {
  transform: translate(-3px, -3px);
  box-shadow: 5px 5px 0 currentColor;
}

.yv-cta--dark {
  background: var(--ink);
  color: var(--paper);
}

.yv-cta--light {
  background: var(--paper);
  color: var(--ink);
}

.yv-text-link {
  color: inherit;
  font-size: .74rem;
  font-weight: var(--font-weight-black);
  letter-spacing: .1em;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: .4rem;
  text-transform: uppercase;
}

.yv-home-hero__side {
  position: absolute;
  right: 1rem;
  bottom: 1.5rem;
  margin: 0;
  font-size: .58rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: .15em;
  writing-mode: vertical-rl;
}

.yv-ticker {
  overflow: hidden;
  padding: calc(var(--spacing) * 4.4) 0;
  border-bottom: 1px solid var(--ink);
  background: var(--ink);
  color: var(--paper);
}

.yv-ticker > div {
  display: flex;
  justify-content: space-around;
  min-width: 70rem;
  gap: calc(var(--spacing) * 8);
}

.yv-ticker span {
  font-size: .72rem;
  font-weight: var(--font-weight-black);
  letter-spacing: .15em;
  text-transform: uppercase;
}

.yv-ticker i {
  color: var(--yellow);
  font-style: normal;
}

.yv-intro {
  display: grid;
  grid-template-columns: .35fr 1fr;
  gap: clamp(calc(var(--spacing) * 8), 8vw, calc(var(--spacing) * 36));
  padding: clamp(calc(var(--spacing) * 20), 11vw, calc(var(--spacing) * 44)) clamp(calc(var(--spacing) * 6), 6vw, calc(var(--spacing) * 28));
}

.yv-intro > div {
  max-width: 70rem;
}

.yv-intro h2,
.yv-featured h2 {
  margin: 0;
  font-size: clamp(3.1rem, 6.8vw, 7.8rem);
  font-weight: var(--font-weight-black);
  letter-spacing: -.07em;
  line-height: .91;
}

.yv-intro > div > p {
  max-width: 40rem;
  margin: calc(var(--spacing) * 12) 0 0 auto;
  font-size: clamp(1.05rem, 1.8vw, 1.45rem);
  font-weight: 600;
  line-height: 1.65;
}

.yv-featured {
  padding: 0 clamp(calc(var(--spacing) * 6), 4vw, calc(var(--spacing) * 18)) clamp(calc(var(--spacing) * 24), 10vw, calc(var(--spacing) * 40));
}

.yv-featured > header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: calc(var(--spacing) * 8);
  margin-bottom: calc(var(--spacing) * 12);
}

.yv-featured header h2 {
  margin-top: calc(var(--spacing) * 4);
  font-size: clamp(2.8rem, 5vw, 5.8rem);
}

.yv-featured__grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: calc(var(--spacing) * 4);
}

.yv-feature {
  color: inherit;
  text-decoration: none;
}

.yv-feature__image {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #d8d4c8;
}

.yv-feature--hero .yv-feature__image {
  aspect-ratio: 6 / 5;
}

.yv-feature__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .6s cubic-bezier(.2,.8,.2,1);
}

.yv-feature:hover img {
  transform: scale(1.035);
}

.yv-feature__image > span {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  background: var(--yellow);
  font-size: .65rem;
  font-weight: var(--font-weight-black);
}

.yv-feature__meta {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 5) calc(var(--spacing) * 0.4) 0;
}

.yv-feature__meta p {
  margin: 0 0 calc(var(--spacing) * 1.8);
  font-size: .62rem;
  font-weight: var(--font-weight-black);
  letter-spacing: .12em;
  text-transform: uppercase;
}

.yv-feature__meta h3 {
  max-width: 31rem;
  margin: 0;
  font-size: clamp(1rem, 1.7vw, 1.5rem);
  font-weight: 850;
  line-height: 1.15;
}

.yv-feature__meta strong {
  flex: none;
  font-size: .8rem;
}

.yv-featured__loading {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: calc(var(--spacing) * 4);
}

.yv-featured__loading div {
  min-height: 32rem;
  background: linear-gradient(110deg, #dedbd1 35%, #ebe8de 50%, #dedbd1 65%);
  background-size: 220% 100%;
  animation: yv-shimmer 1.6s infinite linear;
}

.yv-categories {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  border-top: 1px solid var(--ink);
  border-bottom: 1px solid var(--ink);
}

.yv-category {
  display: flex;
  min-height: 26rem;
  flex-direction: column;
  justify-content: space-between;
  padding: calc(var(--spacing) * 8);
  border-right: 1px solid var(--ink);
  background: #d8d4c8;
  color: inherit;
  text-decoration: none;
  transition: background .25s ease, color .25s ease;
}

.yv-category:last-child {
  border-right: 0;
}

.yv-category--bikes {
  background: var(--ink);
  color: var(--paper);
}

.yv-category--yellow {
  background: var(--yellow);
}

.yv-category:hover {
  background: #ffef12;
  color: var(--ink);
}

.yv-category > span,
.yv-category p {
  margin: 0;
  font-size: .65rem;
  font-weight: var(--font-weight-black);
  letter-spacing: .13em;
  text-transform: uppercase;
}

.yv-category h2 {
  margin: calc(var(--spacing) * 2.4) 0 0;
  font-size: clamp(3rem, 5.8vw, 6.5rem);
  font-weight: var(--font-weight-black);
  letter-spacing: -.07em;
  line-height: .86;
  text-transform: uppercase;
}

.yv-category svg {
  align-self: end;
  width: 2rem;
  height: 2rem;
}

.yv-manifesto {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 48rem;
  background: var(--yellow);
}

.yv-manifesto > img {
  width: 100%;
  height: 100%;
  min-height: 48rem;
  object-fit: cover;
  object-position: 78% center;
  filter: grayscale(1) contrast(1.08);
}

.yv-manifesto > div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(calc(var(--spacing) * 12), 8vw, calc(var(--spacing) * 32));
}

.yv-manifesto blockquote {
  margin: calc(var(--spacing) * 12) 0;
  font-family: var(--font-serif);
  font-size: clamp(2.4rem, 4.4vw, 5rem);
  font-style: italic;
  line-height: 1.05;
}

.yv-manifesto > div > p:not(.yv-section-number) {
  max-width: 32rem;
  margin: 0 0 calc(var(--spacing) * 10);
  font-size: 1.05rem;
  font-weight: 650;
  line-height: 1.7;
}

.yv-manifesto .yv-cta {
  width: fit-content;
}

@keyframes yv-shimmer {
  to { background-position-x: -220%; }
}

@media (max-width: 900px) {
  .yv-home-hero {
    grid-template-columns: 1fr;
  }

  .yv-home-hero__media {
    min-height: 52svh;
  }

  .yv-home-hero__copy {
    min-height: 48svh;
  }

  .yv-intro {
    grid-template-columns: 1fr;
  }

  .yv-featured__grid,
  .yv-featured__loading {
    grid-template-columns: 1fr 1fr;
  }

  .yv-feature:first-child {
    grid-column: 1 / -1;
  }

  .yv-categories {
    grid-template-columns: 1fr;
  }

  .yv-category {
    min-height: 18rem;
    border-right: 0;
    border-bottom: 1px solid var(--ink);
  }

  .yv-manifesto {
    grid-template-columns: 1fr;
  }

  .yv-manifesto > img {
    min-height: 60svh;
  }
}

@media (max-width: 560px) {
  .yv-home-hero__media {
    min-height: 45svh;
  }

  .yv-home-hero h1 {
    font-size: clamp(3.1rem, 15vw, 4.4rem);
  }

  .yv-home-hero__side {
    display: none;
  }

  .yv-featured > header {
    align-items: start;
    flex-direction: column;
  }

  .yv-featured__grid,
  .yv-featured__loading {
    grid-template-columns: 1fr;
  }

  .yv-feature:first-child {
    grid-column: auto;
  }

  .yv-feature__image,
  .yv-feature--hero .yv-feature__image {
    aspect-ratio: 4 / 5;
  }

  .yv-manifesto > img {
    min-height: 48svh;
  }
}

@media (prefers-reduced-motion: reduce) {
  .yv-home-hero__media img,
  .yv-feature__image img,
  .yv-featured__loading div {
    animation: none;
    transition: none;
  }
}
</style>
