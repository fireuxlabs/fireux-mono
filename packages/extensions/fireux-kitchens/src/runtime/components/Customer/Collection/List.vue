<template>
  <div v-if="variant === 'pill'" class="collection-grid">
    <CustomerCardsPill
      v-for="card in cards"
      :key="card.id"
      v-bind="card"
    />
  </div>

  <div v-else class="collection-stack">
    <CustomerCardsCell
      v-for="card in cards"
      :key="card.id"
      v-bind="card"
    />
  </div>
</template>

<script setup lang="ts">
import type { CustomerCard } from '../../../composables/fireux/firestore/profiles/Customer/utils/view/useCustomerInterface'

withDefaults(
  defineProps<{
    cards: CustomerCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
