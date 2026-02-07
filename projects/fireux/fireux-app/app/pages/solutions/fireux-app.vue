<template>
  <UPage>
    <UPageHeader
      title="FireUX App"
      description="A professional website + app we run for you."
    />

    <UPageBody class="space-y-6">
      <template v-if="product">
        <UCard>
          <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="space-y-4">
              <div class="flex flex-wrap gap-2">
                <UBadge color="primary" variant="soft">Hosted</UBadge>
                <UBadge color="neutral" variant="soft">Managed</UBadge>
                <UBadge color="neutral" variant="soft">PWA + Website</UBadge>
              </div>
              <h2 class="text-2xl font-semibold">{{ product.name }}</h2>
              <p class="text-sm text-muted-foreground">{{ product.tagline || product.description }}</p>
              <div
                v-if="product.content"
                class="prose prose-sm max-w-none dark:prose-invert"
                v-html="product.content"
              />
            </div>

            <UCard>
              <template #header>
                <p class="font-semibold">Start here</p>
              </template>
              <div class="space-y-4">
                <p class="text-2xl font-bold">{{ priceLabel }}</p>
                <p class="text-sm text-muted-foreground">
                  Setup, deployment, and maintenance are handled by FireUX.
                </p>
                <div class="flex flex-wrap gap-2">
                  <UButton :to="`/products/${product.slug}`" color="primary" variant="solid">
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
            <p class="font-semibold">What you get</p>
          </template>
          <div class="grid gap-2 sm:grid-cols-2">
            <div
              v-for="(feature, index) in activeFeatures"
              :key="`${feature.title}-${index}`"
              class="flex items-start gap-2 rounded-md border p-3"
            >
              <UIcon name="i-lucide-check-circle-2" class="mt-0.5 text-primary" />
              <p class="text-sm">{{ feature.title }}</p>
            </div>
          </div>
        </UCard>

        <UCard v-if="product.Q || product.A">
          <template #header>
            <p class="font-semibold">Common question</p>
          </template>
          <div class="space-y-2">
            <p v-if="product.Q" class="font-medium">{{ product.Q }}</p>
            <p v-if="product.A" class="text-sm text-muted-foreground">{{ product.A }}</p>
          </div>
        </UCard>
      </template>

      <UAlert
        v-else
        color="amber"
        title="Product not found"
        description="The FireUX App product record is missing."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Price } from 'fireux-products/runtime/models/objects/product.model'
import { useProducts } from 'fireux-products/runtime/composables/fireux/firestore/objects/product/useProducts'

definePageMeta({
  layout: 'default',
  title: 'FireUX App',
  name: 'SolutionsFireuxAppPage',
})

const { fetchProductBySlug, fetchProductPrices } = await useProducts()

const product = await fetchProductBySlug('fireux-app')
if (product?.id) {
  product.prices = await fetchProductPrices(product.id)
}

const activeFeatures = computed(() =>
  (product?.features ?? []).filter((feature) => feature.available)
)

const chosenPrice = computed<Price | null>(() => {
  if (!product?.prices?.length) return null
  const byDefaultId = product.default_price?.id
    ? product.prices.find((price) => price.id === product.default_price.id)
    : null
  return byDefaultId || product.prices[0] || null
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
