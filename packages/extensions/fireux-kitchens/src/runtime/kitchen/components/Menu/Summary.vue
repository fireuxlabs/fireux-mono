<template>
  <div>
    <p v-if="summary.outcome === 'error'" role="alert">
      Could not load this summary.
    </p>
    <p v-else-if="summary.outcome !== 'ready'" role="status">Loading…</p>
    <template v-else>
      <p>{{ summary.status }}</p>
      <ul v-if="summary.flags.length">
        <li v-for="flag in summary.flags" :key="flag">{{ flag }}</li>
      </ul>
    </template>
  </div>
</template>
<script setup lang="ts">
import type { FoodSummary } from '../../utils/food-catalogue-summary'
defineProps<{ summary: FoodSummary & { outcome: string } }>()
</script>
