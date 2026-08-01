<template>
  <main class="yv-shop">
    <section class="yv-shop-hero">
      <UContainer class="yv-shop-hero__inner">
        <div class="yv-shop-hero__copy">
          <p class="yv-eyebrow">Yellow Velo · Interlaken</p>
          <h1>Good bikes.<br>Great stuff.</h1>
          <p>
            Vintage racers, rebuilt mountain bikes, hard-working components,
            proper apparel, and the small things that make a ride better.
          </p>
        </div>

        <dl class="yv-shop-hero__stats">
          <div>
            <dt>In the shop</dt>
            <dd>{{ products.length }}</dd>
          </div>
          <div>
            <dt>Bicycles</dt>
            <dd>{{ bicycleCount }}</dd>
          </div>
          <div>
            <dt>Based in</dt>
            <dd>3800</dd>
          </div>
        </dl>
      </UContainer>
    </section>

    <UContainer class="yv-shop-body">
      <section class="yv-shop-toolbar" aria-label="Shop filters">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          size="xl"
          placeholder="Search bikes, parts, apparel…"
          aria-label="Search the Yellow Velo shop"
          class="yv-shop-search"
        />

        <div class="yv-shop-filters" aria-label="Product categories">
          <UButton
            v-for="category in categories"
            :key="category.value"
            :color="activeCategory === category.value ? 'neutral' : 'primary'"
            :variant="activeCategory === category.value ? 'solid' : 'outline'"
            size="lg"
            @click="activeCategory = category.value"
          >
            {{ category.label }}
            <span>{{ category.count }}</span>
          </UButton>
        </div>
      </section>

      <div class="yv-shop-results">
        <div>
          <p class="yv-eyebrow">{{ activeCategoryLabel }}</p>
          <h2>
            {{ filteredProducts.length }}
            {{ filteredProducts.length === 1 ? 'thing' : 'things' }} worth riding with
          </h2>
        </div>
        <p>Prices and availability follow the Yellow Velo shop.</p>
      </div>

      <div v-if="pending" class="yv-product-grid" aria-label="Loading products">
        <USkeleton v-for="index in 8" :key="index" class="h-[28rem] rounded-none" />
      </div>

      <MoleculesStateCard
        v-else-if="error"
        entity="products"
        state="error"
        title="The shop could not be loaded"
        description="Please try again in a moment."
      />

      <section
        v-else-if="filteredProducts.length"
        class="yv-product-grid"
        aria-label="Yellow Velo products"
      >
        <NuxtLink
          v-for="product in filteredProducts"
          :key="product.id"
          :to="`/products/${product.slug}`"
          class="yv-product-card"
        >
          <div class="yv-product-card__media">
            <img
              :src="product.main_image"
              :alt="product.name"
              loading="lazy"
            >
            <span>{{ primaryCategory(product) }}</span>
          </div>
          <div class="yv-product-card__body">
            <h3>{{ product.name }}</h3>
            <p>{{ productSummary(product) }}</p>
            <div>
              <strong>{{ formatPrice(product) }}</strong>
              <span>View item <UIcon name="i-lucide-arrow-up-right" /></span>
            </div>
          </div>
        </NuxtLink>
      </section>

      <MoleculesStateCard
        v-else
        entity="products"
        state="empty"
        title="Nothing found"
        description="Try another search or category."
      />
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProductCollection } from 'fireux-products/runtime/composables/fireux/firestore/product/fetch/useProductCollection'
import type { FirebaseProduct } from 'fireux-products/runtime/models/product.model'

definePageMeta({
  layout: 'landing',
  title: 'Shop',
  description: 'Shop Yellow Velo bicycles, parts, apparel, and ride goods.',
  nav: {
    key: 'products',
    label: 'Shop',
    icon: 'i-lucide-shopping-bag',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
})

useSeoMeta({
  title: 'Shop - Yellow Velo',
  description:
    'Shop Yellow Velo bicycles, tyres, components, apparel, bags, tools, frames, forks, and accessories.',
})

const fetched = useProductCollection()
const products = computed(() => fetched.products.value ?? [])
const pending = computed(() => fetched.pending.value)
const error = computed(() => fetched.error.value)
const search = ref('')
const route = useRoute()
const requestedCategory = String(route.query.category || '')
const activeCategory = ref(
  ['Bicycles', 'Apparel', 'Components', 'Tyres', 'Accessories'].includes(requestedCategory)
    ? requestedCategory
    : 'all'
)

const categoryDefinitions = [
  { label: 'Everything', value: 'all' },
  { label: 'Bicycles', value: 'Bicycles' },
  { label: 'Apparel', value: 'Apparel' },
  { label: 'Components', value: 'Components' },
  { label: 'Tyres', value: 'Tyres' },
  { label: 'Accessories', value: 'Accessories' },
] as const

const productCategories = (product: FirebaseProduct) => {
  const metadata = product.metadata as { categories?: unknown } | undefined
  return Array.isArray(metadata?.categories)
    ? metadata.categories.map(value => String(value))
    : []
}

const categories = computed(() =>
  categoryDefinitions.map(category => ({
    ...category,
    count: category.value === 'all'
      ? products.value.length
      : products.value.filter(product =>
          productCategories(product).includes(category.value)
        ).length,
  }))
)

const bicycleCount = computed(() =>
  products.value.filter(product =>
    productCategories(product).includes('Bicycles')
  ).length
)

const activeCategoryLabel = computed(() =>
  categories.value.find(category => category.value === activeCategory.value)?.label
    ?? 'Everything'
)

const filteredProducts = computed(() => {
  const query = search.value.trim().toLowerCase()
  return products.value.filter((product) => {
    const categories = productCategories(product)
    const matchesCategory =
      activeCategory.value === 'all' || categories.includes(activeCategory.value)
    if (!matchesCategory) return false
    if (!query) return true
    return [
      product.name,
      product.description,
      ...(categories || []),
      ...(((product.metadata as any)?.brands as string[] | undefined) || []),
    ].join(' ').toLowerCase().includes(query)
  })
})

const primaryCategory = (product: FirebaseProduct) => {
  const categories = productCategories(product)
  return categories.find(category =>
    ['Bicycles', 'Apparel', 'Components', 'Tyres', 'Accessories'].includes(category)
  ) || categories[0] || 'Shop'
}

const productSummary = (product: FirebaseProduct) => {
  const summary = String(product.description || '').replace(/\s+/g, ' ').trim()
  return summary.length > 116 ? `${summary.slice(0, 113).trimEnd()}…` : summary
}

const formatPrice = (product: FirebaseProduct) => {
  const amount = Number(product.default_price?.unit_amount ?? 0)
  const currency = String(product.prices?.[0]?.currency || 'CHF').toUpperCase()
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
    maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100)
}
</script>

<style scoped>
.yv-shop {
  min-height: 100svh;
  background: #f4f1e8;
  color: #050504;
}

.yv-shop-hero {
  border-bottom: 5px solid #050504;
  background: #eddb08;
}

.yv-shop-hero__inner {
  display: grid;
  gap: calc(var(--spacing) * 12);
  padding-block: clamp(calc(var(--spacing) * 18), 10vw, calc(var(--spacing) * 32));
}

.yv-shop-hero__copy {
  max-width: 58rem;
}

.yv-eyebrow {
  margin: 0 0 calc(var(--spacing) * 4);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-black);
  letter-spacing: .16em;
  text-transform: uppercase;
}

.yv-shop-hero h1 {
  margin: 0;
  max-width: 10ch;
  font-family: Montserrat, sans-serif;
  font-size: clamp(4rem, 12vw, 9rem);
  font-weight: var(--font-weight-black);
  letter-spacing: -.075em;
  line-height: .82;
  text-transform: uppercase;
}

.yv-shop-hero__copy > p:last-child {
  max-width: 43rem;
  margin: calc(var(--spacing) * 8) 0 0;
  font-size: clamp(1.05rem, 2vw, 1.35rem);
  font-weight: 650;
  line-height: 1.55;
}

.yv-shop-hero__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  border: 3px solid #050504;
  background: #050504;
  gap: calc(var(--spacing) * 0.75);
}

.yv-shop-hero__stats div {
  padding: calc(var(--spacing) * 5);
  background: #eddb08;
}

.yv-shop-hero__stats dt {
  font-size: .7rem;
  font-weight: 850;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.yv-shop-hero__stats dd {
  margin: calc(var(--spacing) * 1.4) 0 0;
  font-family: Montserrat, sans-serif;
  font-size: clamp(var(--text-2xl), 4vw, 2.5rem);
  font-weight: var(--font-weight-black);
}

.yv-shop-body {
  padding-block: clamp(calc(var(--spacing) * 10), 6vw, calc(var(--spacing) * 20));
}

.yv-shop-toolbar {
  display: grid;
  gap: calc(var(--spacing) * 6);
}

.yv-shop-search {
  width: 100%;
}

.yv-shop-filters {
  display: flex;
  gap: calc(var(--spacing) * 2.6);
  overflow-x: auto;
  padding-bottom: calc(var(--spacing) * 1.6);
  scrollbar-width: thin;
}

.yv-shop-filters button {
  flex: 0 0 auto;
  border: 2px solid #050504;
  border-radius: 0;
  font-weight: 850;
}

.yv-shop-filters button span {
  margin-left: calc(var(--spacing) * 1);
  opacity: .65;
}

.yv-shop-results {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: calc(var(--spacing) * 8);
  margin: clamp(calc(var(--spacing) * 12), 7vw, calc(var(--spacing) * 20)) 0 calc(var(--spacing) * 6);
  padding-bottom: calc(var(--spacing) * 5);
  border-bottom: 3px solid #050504;
}

.yv-shop-results h2 {
  margin: 0;
  font-family: Montserrat, sans-serif;
  font-size: clamp(1.8rem, 4vw, 3.4rem);
  font-weight: var(--font-weight-black);
  letter-spacing: -.045em;
}

.yv-shop-results > p {
  max-width: 20rem;
  margin: 0;
  color: #45443f;
  text-align: right;
}

.yv-product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);
}

.yv-product-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid #050504;
  background: #fff;
  color: inherit;
  text-decoration: none;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.yv-product-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 8px 8px 0 #050504;
}

.yv-product-card:focus-visible {
  outline: 4px solid #eddb08;
  outline-offset: 3px;
}

.yv-product-card__media {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-bottom: 2px solid #050504;
  background: #e8e4da;
}

.yv-product-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 260ms ease;
}

.yv-product-card:hover .yv-product-card__media img {
  transform: scale(1.025);
}

.yv-product-card__media span {
  position: absolute;
  top: .75rem;
  left: .75rem;
  padding: calc(var(--spacing) * 1.4) calc(var(--spacing) * 2.2);
  background: #eddb08;
  color: #050504;
  font-size: .68rem;
  font-weight: var(--font-weight-black);
  letter-spacing: .1em;
  text-transform: uppercase;
}

.yv-product-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: calc(var(--spacing) * 3.2);
  padding: calc(var(--spacing) * 4.6);
}

.yv-product-card h3 {
  margin: 0;
  font-family: Montserrat, sans-serif;
  font-size: clamp(1.05rem, 2vw, 1.35rem);
  font-weight: var(--font-weight-black);
  line-height: 1.08;
}

.yv-product-card__body > p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #5c5a53;
  font-size: .88rem;
  line-height: var(--leading-normal);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.yv-product-card__body > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  margin-top: auto;
  padding-top: calc(var(--spacing) * 1.6);
}

.yv-product-card strong {
  font-family: Montserrat, sans-serif;
  font-size: 1.15rem;
  font-weight: var(--font-weight-black);
}

.yv-product-card__body > div span {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 1);
  font-size: .78rem;
  font-weight: var(--font-weight-extrabold);
}

@media (min-width: 48rem) {
  .yv-shop-hero__inner {
    grid-template-columns: minmax(0, 1.6fr) minmax(18rem, .7fr);
    align-items: end;
  }

  .yv-product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: calc(var(--spacing) * 6);
  }
}

@media (min-width: 72rem) {
  .yv-product-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 40rem) {
  .yv-shop-hero__stats {
    grid-template-columns: 1fr;
  }

  .yv-shop-results {
    align-items: start;
    flex-direction: column;
  }

  .yv-shop-results > p {
    text-align: left;
  }

  .yv-product-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .yv-product-card,
  .yv-product-card__media img {
    transition: none;
  }
}
</style>
