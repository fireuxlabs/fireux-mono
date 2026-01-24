<template>
  <div v-if="variant === 'pill'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <RecipeCardsPill
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      class="block"
    />
  </div>

  <div v-else class="grid gap-3 md:grid-cols-2">
    <RecipeCardsCell
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      class="block"
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
