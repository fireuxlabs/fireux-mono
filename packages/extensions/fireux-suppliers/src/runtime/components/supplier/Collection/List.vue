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
import type { SupplierCard } from '../../../composables/supplier/useSupplierInterface'

withDefaults(
  defineProps<{
    cards: SupplierCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
