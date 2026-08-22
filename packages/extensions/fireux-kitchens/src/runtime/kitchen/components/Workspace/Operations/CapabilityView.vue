<template>
  <div class="grid gap-1">
    <h2 class="m-0 text-lg font-semibold text-highlighted">View</h2>
    <p class="m-0 text-sm text-muted">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  kitchenOperations,
  type KitchenOperationSlug,
} from '../../../models/operations'

const props = defineProps<{ operation: KitchenOperationSlug }>()
const description = computed(
  () =>
    kitchenOperations.find((entry) => entry.slug === props.operation)
      ?.description || ''
)
</script>
