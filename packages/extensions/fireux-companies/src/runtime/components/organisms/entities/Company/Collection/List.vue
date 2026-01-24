<template>
  <div v-if="variant === 'pill'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <CompanyCardsPill
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      class="block"
    />
  </div>

  <div v-else class="grid gap-3 md:grid-cols-2">
    <CompanyCardsCell
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      class="block"
    />
  </div>
</template>

<script setup lang="ts">
import type { CompanyCard } from '../../../../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface';

withDefaults(
  defineProps<{
    cards: CompanyCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
