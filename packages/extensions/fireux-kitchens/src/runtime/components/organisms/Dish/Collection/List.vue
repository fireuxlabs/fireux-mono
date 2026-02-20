<template>
  <div v-if="variant === 'pill'" class="collection-grid">
    <template v-for="card in cards" :key="card.to || card.id">
      <slot name="pill" :card="card" />
    </template>
  </div>

  <div v-else class="collection-stack">
    <template v-for="card in cards" :key="card.to || card.id">
      <slot name="cell" :card="card" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DishCard } from '../../../../composables/fireux/firestore/runtime-kitchen/dish/utils/view/useDishInterface';

withDefaults(
  defineProps<{
    cards: DishCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
