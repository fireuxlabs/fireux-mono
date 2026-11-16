<template>
  <section :data-testid="label">
    <h2>{{ label }}: {{ outcome }} ({{ count }})</h2>
    <p v-if="error">{{ String(error) }}</p>
    <div v-for="kitchen in collection" :key="kitchen.id">
      <p>{{ kitchen.id }}: {{ kitchen.identity.name }}</p>
      <pre
        v-if="kitchen.special"
        :data-testid="`${label}-special-${kitchen.id}`"
        >{{ JSON.stringify(kitchen.special) }}</pre
      >
      <p :data-testid="`${label}-publication-${kitchen.id}`">
        Published menu: {{ kitchen.has_published_menu }}
      </p>
    </div>
  </section>
</template>
<script setup lang="ts">
import { useKitchens } from 'fireux-kitchens/runtime/kitchen/composables/useKitchens'
const props = defineProps<{ label: string; placeId?: string }>()
const reader = useKitchens(
  props.placeId === undefined ? {} : { placeId: () => props.placeId }
)
const { collection, count, outcome, error } = reader
await reader.ready
</script>
