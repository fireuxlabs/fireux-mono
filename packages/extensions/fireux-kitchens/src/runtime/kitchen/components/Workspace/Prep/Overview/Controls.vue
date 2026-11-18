<template>
  <header class="prep-overview-heading">
    <h2 class="fx-type-label">Your preparations</h2>
    <KitchenWorkspacePrepCreate />
  </header>
  <WorkspaceKitchenCollectionToolbar
    v-if="summary.outcome === 'ready'"
    v-model="query"
    label="preparations"
    singular="preparation"
    :count="results.length"
  />
</template>
<script setup lang="ts">
import { requirePrepWorkspace } from '../../../../composables/workspace/prep/state'

const { query, summary, results } = requirePrepWorkspace().overview
</script>
<style scoped>
.prep-overview-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}
.prep-overview-heading h2 {
  margin: 0;
}
</style>
