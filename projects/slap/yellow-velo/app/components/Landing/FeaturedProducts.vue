<template>
  <UPageSection
    headline="Fresh in"
    title="Worth a closer look."
    :links="[{ label: 'Explore the shop', to: '/products' }]"
  >
    <UPageGrid v-if="outcome === 'ready'">
      <UPageCard
        v-for="entry in featuredProducts"
        :key="entry.product.id"
        :to="`/products/${entry.product.slug}`"
        :title="entry.product.name"
        :description="primaryCategory(entry.product)"
      >
        <template #leading>
          <img
            :src="entry.product.main_image"
            :alt="entry.product.name"
            class="product-image"
          />
        </template>
        <template #footer>
          <span>{{ formatPrice(entry.defaultPrice) }}</span>
        </template>
      </UPageCard>
    </UPageGrid>
    <FireState v-else :outcome="outcome" entity="published products" />
  </UPageSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductCollection } from 'fireux-products/runtime/product/composables/useProductCollection'
import type { Product } from 'fireux-products/runtime/product/models/product.model'
import type { ProductPrice } from 'fireux-products/runtime/product/models/product-price.model'

const { productReads, outcome } = useProductCollection({ prices: true })
const featuredProducts = computed(() => {
  const bikes = productReads.value.filter(({ product }) =>
    product.categories.includes('Bicycles')
  )
  const apparel = productReads.value.find(({ product }) =>
    product.categories.includes('Apparel')
  )
  const selected = [...bikes.slice(0, 2), ...(apparel ? [apparel] : [])]
  return (selected.length ? selected : productReads.value).slice(0, 3)
})

const primaryCategory = (product: Product) =>
  product.categories[0] || 'Yellow Velo'

const formatPrice = (price: ProductPrice | null) => {
  if (
    !price ||
    !Number.isFinite(price.unit_amount) ||
    !/^[a-z]{3}$/i.test(price.currency)
  )
    return 'Ask in the shop'
  const amount = price.unit_amount
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: String(price?.currency || 'CHF').toUpperCase(),
    maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100)
}
</script>

<style scoped>
.product-image {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
}
</style>
