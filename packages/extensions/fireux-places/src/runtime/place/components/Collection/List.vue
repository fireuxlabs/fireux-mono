<template>
  <ul
    v-if="variant === 'pill'"
    class="collection-grid place-collection-list place-collection-list--pill"
  >
    <li v-for="card in cards" :key="card.to || card.id">
      <slot name="pill" :card="card" />
    </li>
  </ul>

  <ul
    v-else
    class="collection-stack place-collection-list place-collection-list--cell"
  >
    <li v-for="card in cards" :key="card.to || card.id">
      <slot name="cell" :card="card" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { PlaceCard } from '../../composables/firestore/utils/view/usePlaceInterface';

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

<style scoped>
.place-collection-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.place-collection-list > li {
  min-width: 0;
}

.place-collection-list--cell > li {
  height: 100%;
}
</style>
