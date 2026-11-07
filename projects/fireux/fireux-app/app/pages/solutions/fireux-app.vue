<!-- Concurrent edit — 2026-07-20 23:38 CEST — Final app CSS pass: semantic colors. -->
<template>
  <UPage>
    <UPageHeader
      title="FireUX App"
      description="A professional website + app we run for you."
    />

    <UPageBody>
      <template v-if="product">
        <UCard>
          <div class="pagebody">
            <div class="fx-card-body-stack">
              <div class="card__badges">
                <UBadge color="primary" variant="soft">Hosted</UBadge>
                <UBadge color="neutral" variant="soft">Managed</UBadge>
                <UBadge color="neutral" variant="soft">PWA + Website</UBadge>
              </div>
              <h2 class="fx-type-section-title">{{ product.name }}</h2>
              <p class="fx-type-caption">
                {{ product.tagline || product.description }}
              </p>
              <div
                v-if="product.content"
                class="prose prose-sm dark:prose-invert"
                v-html="product.content"
              />
            </div>

            <UCard>
              <template #header>
                <p class="fx-type-body">Start here</p>
              </template>
              <div class="fx-card-body-stack">
                <p class="fx-type-body">{{ priceLabel }}</p>
                <p class="fx-type-caption">
                  Setup, deployment, and maintenance are handled by FireUX.
                </p>
                <div class="fx-card__actions">
                  <UButton
                    :to="`/products/${product.slug}`"
                    color="primary"
                    variant="solid"
                  >
                    Buy now
                  </UButton>
                  <UButton to="/products" color="neutral" variant="outline">
                    Back to products
                  </UButton>
                </div>
              </div>
            </UCard>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <p class="fx-type-body">What you get</p>
          </template>
          <div class="pagebody">
            <UCard
              v-for="(feature, index) in activeFeatures"
              :key="`${feature.title}-${index}`"
            >
              <UIcon name="i-lucide-check-circle-2" />
              <p class="fx-type-caption">{{ feature.title }}</p>
            </UCard>
          </div>
        </UCard>

        <UCard v-if="product.Q || product.A">
          <template #header>
            <p class="fx-type-body">Common question</p>
          </template>
          <div class="fx-card-body-stack">
            <p v-if="product.Q" class="fx-type-body">{{ product.Q }}</p>
            <p v-if="product.A" class="fx-type-caption">{{ product.A }}</p>
          </div>
        </UCard>
      </template>

      <UAlert
        v-else
        color="warning"
        title="Product not found"
        description="The FireUX App product record is missing."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Product } from 'fireux-products/runtime/product/models/product.model'
import type { ProductPrice } from 'fireux-products/runtime/product/models/product-price.model'
import { useProductFetch } from 'fireux-products/runtime/product/composables/firestore/fetch/useProductFetch'
import { useProductPrices } from 'fireux-products/runtime/product/composables/firestore/price/fetch/useProductPrices'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  layout: 'default',
  title: 'FireUX App',
  name: 'SolutionsFireuxAppPage',
})

useSeo({
  title: 'FireUX App',
  description: 'A professional website and App operated by FireUX.',
  path: '/solutions/fireux-app',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      title: context.title,
    }),
})

const { fetchProductBySlug } = useProductFetch()
const { fetchProductPrices } = useProductPrices()

const productSource = fetchProductBySlug('fireux-app')
const productPrices = ref<ProductPrice[]>([])

watch(
  productSource,
  async (nextProduct: Product | undefined) => {
    productPrices.value = nextProduct?.id
      ? await fetchProductPrices(nextProduct.id)
      : []
  },
  { immediate: true }
)

const product = computed(() => productSource.value || null)

const activeFeatures = computed(() =>
  (product.value?.features ?? []).filter((feature) => feature.available)
)

const chosenPrice = computed<ProductPrice | null>(() => {
  const activePrices = productPrices.value.filter(
    (price) => price.active !== false
  )
  return activePrices.find((price) => price.default) || activePrices[0] || null
})

const priceLabel = computed(() => {
  const price = chosenPrice.value
  if (!price) return 'Pricing on request'
  const amount = Number(price.unit_amount || 0) / 100
  const currency = String(price.currency || 'CHF').toUpperCase()
  const formatted = new Intl.NumberFormat('en-CH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
  return price.interval ? `${formatted} / ${price.interval}` : formatted
})
</script>
