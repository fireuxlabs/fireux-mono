<template>
  <p v-if="outcome === 'pending'" role="status">Loading item…</p>
  <UAlert
    v-else-if="outcome === 'error'"
    color="error"
    title="Item unavailable"
    description="This item could not be loaded."
  />
  <p v-else-if="outcome === 'empty'" role="status">Item not found.</p>
  <p v-else-if="outcome === 'idle'" role="status">
    Select a Kitchen to view this item.
  </p>
</template>

<script setup lang="ts">
import type { ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'

defineProps<{ outcome: ReadOutcome }>()
</script>
