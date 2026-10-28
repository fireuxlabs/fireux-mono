<template>
  <main v-if="product" class="yv-detail">
    <UContainer class="yv-detail__shell">
      <NuxtLink to="/products" class="yv-detail__back">
        <UIcon name="i-lucide-arrow-left" />
        Back to the shop
      </NuxtLink>

      <article class="yv-detail__product">
        <div class="yv-detail__media">
          <img :src="product.main_image" :alt="product.name" />
          <span>{{ primaryCategory }}</span>
        </div>

        <div class="yv-detail__copy">
          <p class="yv-detail__eyebrow">Yellow Velo · {{ primaryCategory }}</p>
          <h1>{{ product.name }}</h1>
          <p class="yv-detail__price">{{ formattedPrice }}</p>
          <p class="yv-detail__summary">{{ product.description }}</p>

          <dl
            v-if="brands.length || categories.length"
            class="yv-detail__facts"
          >
            <div v-if="brands.length">
              <dt>Brand</dt>
              <dd>{{ brands.join(', ') }}</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>Listed in the Yellow Velo shop</dd>
            </div>
          </dl>

          <UButton
            v-if="sourceUrl"
            :to="sourceUrl"
            external
            target="_blank"
            size="xl"
            color="neutral"
            icon="i-lucide-shopping-bag"
            class="yv-detail__action"
          >
            View in the original shop
          </UButton>
        </div>
      </article>

      <section v-if="product.content" class="yv-detail__description">
        <p class="yv-detail__eyebrow">The details</p>
        <h2>About this item</h2>
        <p>{{ product.content }}</p>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { useAsyncData } from 'nuxt/app'

import { computed } from 'vue'
import { readRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useProductSeo } from 'fireux-products/runtime/product/composables/useProductSeo'
import type { ProductRead } from 'fireux-products/runtime/product/utils/product'

definePageMeta({
  layout: 'landing',
})

const route = useRoute()
const slug = readRouteParam(route.params.slug)
const { data: read } = await useAsyncData(
  `yellow-velo-product-${slug}`,
  async (_nuxtApp, { signal }) => {
    const fetchRead = $fetch.create({ signal, cache: 'no-store' })
    return fetchRead<ProductRead>(`/api/products/${encodeURIComponent(slug)}`)
  }
)
const product = computed(() => read.value?.product || null)
const defaultPrice = computed(() => read.value?.defaultPrice || null)

useProductSeo(product, defaultPrice)

const categories = computed(() => product.value?.categories || [])
const brands = computed(() => product.value?.brands || [])
const primaryCategory = computed(
  () =>
    categories.value.find((category) =>
      ['Bicycles', 'Apparel', 'Components', 'Tyres', 'Accessories'].includes(
        category
      )
    ) ||
    categories.value[0] ||
    'Shop'
)
const sourceUrl = computed(() => {
  const value = String(product.value?.source_url || '')
  return value.startsWith('https://yellow-velo.ch/') ? value : ''
})
const formattedPrice = computed(() => {
  const amount = Number(defaultPrice.value?.unit_amount ?? 0)
  const currency = String(defaultPrice.value?.currency || 'CHF').toUpperCase()
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
    maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100)
})
</script>

<style scoped>
.yv-detail {
  min-height: 100svh;
  background: #f4f1e8;
  color: #050504;
}

.yv-detail__shell {
  padding-block: clamp(
    calc(var(--spacing) * 8),
    5vw,
    calc(var(--spacing) * 20)
  );
}

.yv-detail__back {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 8);
  color: inherit;
  font-size: 0.8rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
}

.yv-detail__product {
  display: grid;
  border: 3px solid #050504;
  background: #fff;
}

.yv-detail__media {
  position: relative;
  min-height: 22rem;
  overflow: hidden;
  border-bottom: 3px solid #050504;
  background: #e8e4da;
}

.yv-detail__media img {
  width: 100%;
  height: 100%;
  min-height: 22rem;
  object-fit: cover;
}

.yv-detail__media span {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: calc(var(--spacing) * 1.8) calc(var(--spacing) * 2.6);
  background: #eddb08;
  font-size: 0.72rem;
  font-weight: var(--font-weight-black);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.yv-detail__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: clamp(calc(var(--spacing) * 6), 5vw, calc(var(--spacing) * 18));
}

.yv-detail__eyebrow {
  margin: 0 0 calc(var(--spacing) * 4);
  font-size: 0.72rem;
  font-weight: var(--font-weight-black);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.yv-detail h1 {
  margin: 0;
  font-family: Montserrat, sans-serif;
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  font-weight: var(--font-weight-black);
  letter-spacing: -0.06em;
  line-height: 0.92;
}

.yv-detail__price {
  margin: calc(var(--spacing) * 6) 0 0;
  padding: calc(var(--spacing) * 1.8) calc(var(--spacing) * 2.6);
  background: #eddb08;
  font-family: Montserrat, sans-serif;
  font-size: 1.4rem;
  font-weight: var(--font-weight-black);
}

.yv-detail__summary {
  margin: calc(var(--spacing) * 7) 0 0;
  color: #4c4a44;
  font-size: 1.05rem;
  line-height: 1.65;
}

.yv-detail__facts {
  display: grid;
  width: 100%;
  gap: calc(var(--spacing) * 4);
  margin: calc(var(--spacing) * 8) 0 0;
  padding-top: calc(var(--spacing) * 6);
  border-top: 2px solid #050504;
}

.yv-detail__facts dt {
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.yv-detail__facts dd {
  margin: calc(var(--spacing) * 1) 0 0;
  font-weight: var(--font-weight-bold);
}

.yv-detail__action {
  margin-top: calc(var(--spacing) * 8);
  border: 2px solid #050504;
  border-radius: 0;
}

.yv-detail__description {
  max-width: 55rem;
  margin: clamp(calc(var(--spacing) * 12), 8vw, calc(var(--spacing) * 28)) auto
    0;
}

.yv-detail__description h2 {
  margin: 0;
  font-family: Montserrat, sans-serif;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: var(--font-weight-black);
  letter-spacing: -0.05em;
}

.yv-detail__description > p:last-child {
  margin: calc(var(--spacing) * 6) 0 0;
  color: #4c4a44;
  font-size: 1.05rem;
  line-height: 1.8;
  white-space: pre-line;
}

@media (min-width: 60rem) {
  .yv-detail__product {
    grid-template-columns: minmax(0, 1.15fr) minmax(26rem, 0.85fr);
  }

  .yv-detail__media {
    border-right: 3px solid #050504;
    border-bottom: 0;
  }

  .yv-detail__facts {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
