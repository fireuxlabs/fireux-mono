<template>
  <ul
    v-if="variant === 'pill'"
    class="collection-grid kitchen-collection-list kitchen-collection-list--pill"
  >
    <li v-for="card in cards" :key="card.to || card.id">
      <slot name="pill" :card="card" />
    </li>
  </ul>

  <ul
    v-else
    class="collection-stack kitchen-collection-list kitchen-collection-list--cell"
  >
    <li v-for="card in cards" :key="card.to || card.id">
      <slot name="cell" :card="card" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { KitchenCard } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

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

<style scoped>
.kitchen-collection-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.kitchen-collection-list > li {
  min-width: 0;
}

.kitchen-collection-list--cell > li {
  height: 100%;
}
</style>
