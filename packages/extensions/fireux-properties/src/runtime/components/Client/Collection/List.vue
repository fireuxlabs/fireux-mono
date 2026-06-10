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
import type { ClientCard } from '../../../composables/fireux/console/portfolio/Operations/Clients/utils/view/useClientInterface'

withDefaults(
  defineProps<{
    cards: ClientCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
