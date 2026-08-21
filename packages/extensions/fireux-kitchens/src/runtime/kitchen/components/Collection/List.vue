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
import type { KitchenCard } from '../../composables/firestore/utils/view/useKitchenInterface'

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

.kitchen-collection-list--cell {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: calc(var(--spacing) * 6);
}

@media (max-width: 980px) {
  .kitchen-collection-list--cell { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .kitchen-collection-list--cell { grid-template-columns: 1fr; }
}
</style>
