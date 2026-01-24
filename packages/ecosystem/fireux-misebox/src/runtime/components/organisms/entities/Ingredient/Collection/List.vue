<template>
  <div v-if="variant === 'pill'">
    <IngredientCardsPill
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>

  <div v-else>
    <IngredientCardsCell
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>
</template>

<script setup lang="ts">
import type { IngredientCard } from '../../../../../composables/fireux/firestore/objects/ingredient/utils/view/useIngredientInterface';

withDefaults(
  defineProps<{
    cards: IngredientCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
