<template>
  <div class="workspace-surface__grid">
    <h2>View</h2>
    <p>{{ description }}</p>
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
