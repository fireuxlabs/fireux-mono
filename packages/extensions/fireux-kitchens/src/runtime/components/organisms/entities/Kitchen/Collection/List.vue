<template>
  <div v-if="variant === 'pill'">
    <KitchenCardsPill
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>

  <div v-else>
    <KitchenCardsCell
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>
</template>

<script setup lang="ts">
import type { KitchenCard } from '../../../../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface';

withDefaults(
  defineProps<{
    cards: KitchenCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
