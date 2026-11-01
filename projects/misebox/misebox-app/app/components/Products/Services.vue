<template>
  <div>
    <ProductSurface
      v-for="(offer, index) in offers"
      :key="offer.product.id"
      :product="offer.product"
      :action="offer.action"
      :preview-component="KitchenOffersPreview"
      :preview-props="{ kind: offer.kind }"
      :reverse="index % 2 === 1"
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import KitchenOffersPreview from 'fireux-kitchens/runtime/kitchen/components/Offers/Preview.vue'
import type { Product } from 'fireux-products/runtime/product/models/product.model'
const props = defineProps<{ products: readonly Product[] }>()
const selections = [
  {
    id: 'menu-express',
    kind: 'menu' as const,
    action: { label: 'Get my menu online', to: '/products/menu-express' },
  },
  {
    id: 'collection-ordering',
    kind: 'collection' as const,
    action: {
      label: 'Explore Collection Ordering',
      to: '/products/collection-ordering',
    },
  },
]
const offers = computed(() =>
  selections.flatMap((selection) => {
    const product = props.products.find(
      (product) => product.id === selection.id
    )
    return product ? [{ ...selection, product }] : []
  })
)
</script>
