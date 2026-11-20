<template>
  <p
    v-if="summary.outcome !== 'ready'"
    :role="summary.outcome === 'error' ? 'alert' : 'status'"
  >
    {{ summary.status }}
  </p>
  <p v-else-if="!results.length" role="status">
    {{ query.trim() ? 'No matching preparations.' : 'No preparations yet.' }}
  </p>
  <UPageGrid v-else as="ul" aria-label="Preparation preview">
    <li
      v-for="preparation in visiblePreparations"
      :key="preparation.id"
      class="prep-preview-entry"
    >
      <UPageCard
        :title="preparation.name"
        :description="preparation.description || undefined"
        :to="`/workspace/kitchen/prep/preparations/${encodeURIComponent(preparation.id)}`"
        icon="i-lucide-cooking-pot"
        variant="outline"
      />
    </li>
  </UPageGrid>
  <p
    v-if="
      summary.outcome === 'ready' && results.length > visiblePreparations.length
    "
    class="fx-type-caption"
  >
    Showing {{ visiblePreparations.length }} of {{ results.length }}
  </p>
  <UButton
    v-if="summary.outcome === 'ready'"
    to="/workspace/kitchen/prep/preparations"
    label="Open preparations"
    variant="soft"
    color="neutral"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenPrepOverview } from '../../../../composables/workspace/prep/index'

const { query, summary, results } = useKitchenPrepOverview()
const visiblePreparations = computed(() => results.value.slice(0, 6))
</script>

<style scoped>
.prep-preview-entry {
  display: grid;
  min-width: 0;
}
</style>
