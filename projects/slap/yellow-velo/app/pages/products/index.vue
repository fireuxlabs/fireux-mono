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
            <dd>{{ productReads.length }}</dd>
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
          v-for="entry in filteredProducts"
          :key="entry.product.id"
          :to="`/products/${entry.product.slug}`"
          class="yv-product-card"
        >
          <div class="yv-product-card__media">
            <img
              :src="entry.product.main_image"
              :alt="entry.product.name"
              loading="lazy"
            >
            <span>{{ primaryCategory(entry.product) }}</span>
          </div>
          <div class="yv-product-card__body">
            <h3>{{ entry.product.name }}</h3>
            <p>{{ productSummary(entry.product) }}</p>
            <div>
              <strong>{{ formatPrice(entry.defaultPrice) }}</strong>
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
import { useProductCollection } from 'fireux-products/runtime/product/composables/firestore/fetch/useProductCollection'
import type { FirebaseProduct, ProductPrice } from 'fireux-products/runtime/product/models/product.model'

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
const productReads = computed(() => fetched.reads.value ?? [])
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
  return product.categories
}

const categories = computed(() =>
  categoryDefinitions.map(category => ({
    ...category,
    count: category.value === 'all'
      ? productReads.value.length
      : productReads.value.filter(({ product }) =>
          productCategories(product).includes(category.value)
        ).length,
  }))
)

const bicycleCount = computed(() =>
  productReads.value.filter(({ product }) =>
    productCategories(product).includes('Bicycles')
  ).length
)

const activeCategoryLabel = computed(() =>
  categories.value.find(category => category.value === activeCategory.value)?.label
    ?? 'Everything'
)

const filteredProducts = computed(() => {
  const query = search.value.trim().toLowerCase()
  return productReads.value.filter((entry) => {
    const product = entry.product
    const categories = productCategories(product)
    const matchesCategory =
      activeCategory.value === 'all' || categories.includes(activeCategory.value)
    if (!matchesCategory) return false
    if (!query) return true
    return [
      product.name,
      product.description,
      ...(categories || []),
      ...product.brands,
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

const formatPrice = (price: ProductPrice | null) => {
  const amount = Number(price?.unit_amount ?? 0)
  const currency = String(price?.currency || 'CHF').toUpperCase()
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
    maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100)
}
</script>

<style scoped src="./products-index.css"></style>
