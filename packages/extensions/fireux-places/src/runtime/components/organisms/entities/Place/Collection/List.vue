<template>
  <div v-if="variant === 'pill'">
    <PlaceCardsPill
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>

  <div v-else>
    <PlaceCardsCell
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>
</template>

<script setup lang="ts">
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';

withDefaults(
  defineProps<{
    cards: PlaceCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
