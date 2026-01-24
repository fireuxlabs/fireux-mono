<template>
  <div v-if="variant === 'pill'">
    <RecipeCardsPill
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>

  <div v-else>
    <RecipeCardsCell
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>
</template>

<script setup lang="ts">
import type { RecipeCard } from '../../../../../composables/fireux/firestore/objects/recipe/utils/view/useRecipeInterface';

withDefaults(
  defineProps<{
    cards: RecipeCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
