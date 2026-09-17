<template>
  <div class="grid gap-1">
    <h2 class="m-0 text-lg font-semibold text-highlighted">View</h2>
    <p class="m-0 text-sm text-muted">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  kitchenCapabilities,
  type KitchenCapabilitySlug,
} from '../../../models/capabilities'

const props = defineProps<{ capability: KitchenCapabilitySlug }>()
const description = computed(
  () =>
    kitchenCapabilities.find((entry) => entry.slug === props.capability)
      ?.description || ''
)
</script>
