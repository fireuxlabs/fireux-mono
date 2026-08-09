<!-- Concurrent edit — 2026-07-20 23:38 CEST — Final app CSS pass: semantic colors. -->
<template>
  <UPage>
    <UPageHeader
      title="FireUX Template"
      description="A neutral starter app you buy once and run yourself."
    />

    <UPageBody class="space-y-6">
      <template v-if="product">
        <UCard>
          <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="space-y-4">
              <div class="flex flex-wrap gap-2">
                <UBadge color="primary" variant="soft"
                  >One-time purchase</UBadge
                >
                <UBadge color="neutral" variant="soft">Self-hosted</UBadge>
                <UBadge color="neutral" variant="soft"
                  >Developer starter</UBadge
                >
              </div>
              <h2 class="text-2xl font-semibold">{{ product.name }}</h2>
              <p class="text-sm text-toned">
                {{ product.tagline || product.description }}
              </p>
              <div
                v-if="product.content"
                class="prose prose-sm max-w-none dark:prose-invert"
                v-html="product.content"
              />
            </div>

            <UCard>
              <template #header>
                <p class="font-semibold">Buy template</p>
              </template>
              <div class="space-y-4">
                <p class="text-2xl font-bold">{{ priceLabel }}</p>
                <p class="text-sm text-toned">
                  Includes Products + Blogs baseline and a clean FireUX app
                  structure.
                </p>
                <div class="flex flex-wrap gap-2">
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
            <p class="font-semibold">What is included</p>
          </template>
          <div class="grid gap-2 sm:grid-cols-2">
            <div
              v-for="(feature, index) in activeFeatures"
              :key="`${feature.title}-${index}`"
              class="flex items-start gap-2 rounded-md border p-3"
            >
              <UIcon
                name="i-lucide-check-circle-2"
                class="mt-0.5 text-primary"
              />
              <p class="text-sm">{{ feature.title }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <p class="font-semibold">Upsell path</p>
          </template>
          <p class="text-sm text-toned">
            Add modules later as your project grows. Start lean, then extend
            with optional capabilities.
          </p>
        </UCard>

        <UCard v-if="product.Q || product.A">
          <template #header>
            <p class="font-semibold">Common question</p>
          </template>
          <div class="space-y-2">
            <p v-if="product.Q" class="font-medium">{{ product.Q }}</p>
            <p v-if="product.A" class="text-sm text-toned">{{ product.A }}</p>
          </div>
        </UCard>
      </template>

      <UAlert
        v-else
        color="warning"
        title="Product not found"
        description="The FireUX Template product record is missing."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  FirebaseProduct,
  Price,
} from 'fireux-products/runtime/models/product.model'
import { useProductFetch } from 'fireux-products/runtime/composables/fireux/firestore/product/fetch/useProductFetch'
import { useProductPrices } from 'fireux-products/runtime/composables/fireux/firestore/product/price/fetch/useProductPrices'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  layout: 'default',
  title: 'FireUX Template',
  name: 'SolutionsFireuxTemplatePage',
})

useSeo({
  title: 'FireUX Template',
  description: 'A neutral FireUX starter App you buy once and run yourself.',
  path: '/solutions/fireux-template',
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

const productSource = fetchProductBySlug('fireux-template')
const productPrices = ref<Price[]>([])

watch(
  productSource,
  async (nextProduct: FirebaseProduct | undefined) => {
    productPrices.value = nextProduct?.id
      ? await fetchProductPrices(nextProduct.id)
      : []
  },
  { immediate: true }
)

const product = computed(() =>
  productSource.value
    ? {
        ...productSource.value,
        prices: productPrices.value,
      }
    : null
)

const activeFeatures = computed(() =>
  (product.value?.features ?? []).filter((feature) => feature.available)
)

const chosenPrice = computed<Price | null>(() => {
  if (!product.value?.prices?.length) return null
  const byDefaultId = product.value.default_price?.id
    ? product.value.prices.find(
        (price: Price) => price.id === product.value?.default_price.id
      )
    : null
  return byDefaultId || product.value.prices[0] || null
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
