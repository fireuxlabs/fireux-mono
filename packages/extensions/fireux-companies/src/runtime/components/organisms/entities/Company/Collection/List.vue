<template>
  <div v-if="variant === 'pill'">
    <CompanyCardsPill
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>

  <div v-else>
    <CompanyCardsCell
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
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
