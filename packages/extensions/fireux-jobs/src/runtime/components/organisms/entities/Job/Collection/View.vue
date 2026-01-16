<template>
  <JobCollectionManager :cards="cards" :total="total" />
</template>

<script setup lang="ts">
import type { JobCard } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface';

withDefaults(
  defineProps<{
    cards: JobCard.Card[]
    total?: number
  }>(),
  {
    total: undefined,
  }
)
</script>
