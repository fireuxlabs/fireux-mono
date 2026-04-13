<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h2 class="text-lg font-semibold">Solutions</h2>
        <p class="text-sm text-muted-foreground">
          Jump to dedicated pages for selected FireUX offers.
        </p>
      </div>
    </template>

    <div class="space-y-3">
      <NuxtLink
        v-for="item in solutionItems"
        :key="item.product.id || item.product.slug"
        :to="resolveSolutionRoute(item.product)"
        class="block"
      >
        <ProductCardsPreview
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
      color="amber"
      title="No solution products found"
      description="Create FireUX starter products to show solution previews here."
      class="mt-3"
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FirebaseProduct } from '../../../../models/product.model'
import { useProductFetch } from '../../../composables/fireux/firestore/product/fetch/useProductFetch'
import { useProductInterface } from '../../../composables/fireux/firestore/product/utils/view/useProductInterface'

const SOLUTION_ROUTES: Record<string, string> = {
  'fireux-app': '/solutions/fireux-app',
  'fireux-template': '/solutions/fireux-template',
}
const SOLUTION_SLUGS = Object.keys(SOLUTION_ROUTES)

const { products } = useProductFetch()
const { pill: mapCard } = useProductInterface()

const solutionItems = computed(() =>
  SOLUTION_SLUGS
    .map((slug) =>
      (products.value ?? []).find(
        (product) => product.slug === slug || product.id === slug
      )
    )
    .filter((product): product is FirebaseProduct => Boolean(product))
    .map((product) => {
      const card = mapCard(product)
      return card ? { product, card } : null
    })
    .filter(
      (
        item
      ): item is {
        product: FirebaseProduct
        card: NonNullable<ReturnType<typeof mapCard>>
      } => Boolean(item)
    )
)

const resolveSolutionRoute = (product: FirebaseProduct) => {
  const slug = String(product.slug || product.id || '').trim()
  if (SOLUTION_ROUTES[slug]) return SOLUTION_ROUTES[slug]
  return slug ? `/products/${slug}` : '/products'
}
</script>
