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
      <NuxtLink
        :to="`/workspace/kitchen/prep/preparations/${encodeURIComponent(preparation.id)}`"
        class="prep-preview-link"
      >
        <span>{{ preparation.name }}</span>
        <UIcon name="i-lucide-chevron-right" aria-hidden="true" />
      </NuxtLink>
    </li>
  </ul>
  <p
    v-if="summary.outcome === 'ready' && preparations.length > 5"
    class="fx-type-caption"
  >
    Showing 5 of {{ preparations.length }}
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
import type { Preparation } from '../../../../records/prep/preparations/preparation'
import type { PrepSummary } from '../../../../composables/workspace/prep/summaries'

defineProps<{
  summary: PrepSummary
  preparations: Preparation[]
  searching: boolean
}>()
</script>

<style scoped>
.prep-preview-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  padding-block: calc(var(--spacing) * 2);
  border-bottom: 1px solid var(--ui-border);
}
.prep-preview-link:hover {
  color: var(--ui-primary);
}
</style>
