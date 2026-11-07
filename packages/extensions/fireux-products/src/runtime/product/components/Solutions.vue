<template>
  <UCard>
    <template #header>
      <div class="fx-card-body-stack">
        <h2 class="fx-type-card-heading">Solutions</h2>
        <p>Jump to dedicated pages for selected FireUX offers.</p>
      </div>
    </template>

    <div class="fx-card-body-stack">
      <NuxtLink
        v-for="item in solutionItems"
        :key="item.product.id"
        :to="resolveSolutionRoute(item.product)"
      >
        <ProductCardsSummary
          :card="item.card"
          :product="item.product"
          prop="Solution"
          :show-badges="true"
          :show-body="true"
        />
      </NuxtLink>
    </div>

    <UAlert
      v-if="!solutionItems.length"
      color="warning"
      title="No solution products found"
      description="Create FireUX starter products to show solution previews here."
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '../utils/product.ts'
import { useProductCollection } from '../composables/useProductCollection'
import { useProductInterface } from '../composables/useProductInterface'

const SOLUTION_ROUTES: Record<string, string> = {
  'fireux-app': '/solutions/fireux-app',
  'fireux-template': '/solutions/fireux-template',
}
const SOLUTION_PRODUCT_IDS = Object.keys(SOLUTION_ROUTES)

const { products } = useProductCollection()
const { pill: mapCard } = useProductInterface()

const solutionItems = computed(() =>
  SOLUTION_PRODUCT_IDS.map((productId) =>
    (products.value ?? []).find((product) => product.id === productId)
  )
    .filter((product): product is Product => Boolean(product))
    .map((product) => {
      const card = mapCard(product)
      return card ? { product, card } : null
    })
    .filter(
      (
        item
      ): item is {
        product: Product
        card: NonNullable<ReturnType<typeof mapCard>>
      } => Boolean(item)
    )
)

const resolveSolutionRoute = (product: Product) => {
  const id = String(product.id || '').trim()
  if (SOLUTION_ROUTES[id]) return SOLUTION_ROUTES[id]
  return id ? `/products/${id}` : '/products'
}
</script>
