<template>
  <div class="grid gap-2 text-sm">
    <p v-if="summary.outcome === 'error'" role="alert" class="text-muted">
      Could not load this summary.
    </p>
    <p v-else-if="summary.outcome !== 'ready'" role="status" class="text-muted">
      Loading…
    </p>
    <template v-else>
      <p class="text-muted">{{ summary.status }}</p>
      <ul v-if="summary.flags.length" class="grid gap-1 text-warning">
        <li v-for="flag in summary.flags" :key="flag">{{ flag }}</li>
      </ul>
    </template>
  </div>
</template>
<script setup lang="ts">
import type { FoodSummary } from '../../../utils/food-catalogue-summary'
defineProps<{ summary: FoodSummary & { outcome: string } }>()
</script>
