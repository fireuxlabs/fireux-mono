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

<style scoped src="./yellow-velo-home.css"></style>
