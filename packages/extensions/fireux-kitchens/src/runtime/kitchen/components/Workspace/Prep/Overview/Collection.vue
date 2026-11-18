<template>
  <p
    v-if="summary.outcome !== 'ready'"
    :role="summary.outcome === 'error' ? 'alert' : 'status'"
  >
    {{ summary.status }}
  </p>
  <p v-else-if="!preparations.length" role="status">
    {{ searching ? 'No matching preparations.' : 'No preparations yet.' }}
  </p>
  <ul v-else aria-label="Preparation preview">
    <li v-for="preparation in preparations.slice(0, 5)" :key="preparation.id">
      {{ preparation.name }}
    </li>
  </ul>
  <UButton
    v-if="summary.outcome === 'ready'"
    to="/workspace/kitchen/prep/preparations"
    label="Open preparations"
    variant="soft"
    color="neutral"
  />
</template>
<script setup lang="ts">
import type { Preparation } from '../../../../records/prep/preparations/preparation'
import type { PrepSummary } from '../../../../composables/workspace/prep/summaries'

defineProps<{
  summary: PrepSummary
  preparations: Preparation[]
  searching: boolean
}>()
</script>
