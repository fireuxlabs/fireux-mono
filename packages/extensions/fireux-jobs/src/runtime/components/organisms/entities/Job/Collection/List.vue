<template>
  <div v-if="variant === 'pill'">
    <JobCardsPill
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>

  <div v-else>
    <JobCardsCell
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>
</template>

<script setup lang="ts">
import type { JobCard } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface';

withDefaults(
  defineProps<{
    cards: JobCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
