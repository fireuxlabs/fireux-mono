<template>
  <div v-if="variant === 'pill'" class="collection-grid">
    <DriverCardsPill
      v-for="card in cards"
      :key="card.id"
      v-bind="card"
    />
  </div>

  <div v-else class="collection-stack">
    <DriverCardsCell
      v-for="card in cards"
      :key="card.id"
      v-bind="card"
    />
  </div>
</template>

<script setup lang="ts">
import type { DriverCard } from '../../../composables/fireux/firestore/profiles/Driver/utils/view/useDriverInterface'

withDefaults(
  defineProps<{
    cards: DriverCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
