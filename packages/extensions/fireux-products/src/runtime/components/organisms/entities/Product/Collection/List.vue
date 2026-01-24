<template>
  <div v-if="variant === 'pill'">
    <ProductCardsPill
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>

  <div v-else>
    <ProductCardsCell
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>
</template>

<script setup lang="ts">
import type { ProductCard } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface';

withDefaults(
  defineProps<{
    cards: ProductCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
