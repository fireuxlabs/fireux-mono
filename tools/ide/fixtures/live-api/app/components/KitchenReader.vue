<script setup lang="ts">
import { useKitchens } from 'fireux-kitchens/runtime/kitchen/composables/useKitchens'
const props = defineProps<{ label: string; placeId?: string }>()
const reader = useKitchens(
  props.placeId === undefined ? {} : { placeId: () => props.placeId }
)
const { collection, count, outcome, error } = reader
await reader.ready
</script>

<template>
  <section :data-testid="label">
    <h2>{{ label }}: {{ outcome }} ({{ count }})</h2>
    <p v-if="error">{{ String(error) }}</p>
    <p v-for="kitchen in collection" :key="kitchen.id">
      {{ kitchen.id }}: {{ kitchen.identity.name }}
    </p>
  </section>
</template>
