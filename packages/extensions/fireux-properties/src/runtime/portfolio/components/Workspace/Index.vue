<template>
  <WorkspaceCapability
    id="workspace-entity-controls"
    collection-label="Portfolios"
    single-label="Details"
  >
    <template #collection-panel
      ><WorkspacePortfolioHomeCollection :workspace="workspace"
    /></template>
    <template #single-panel
      ><WorkspacePortfolioHomeSingle
        :entity="selected"
        :outcome="workspace.collectionOutcome.value"
    /></template>
  </WorkspaceCapability>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceCapability from 'fireux-core/runtime/workspace/components/Capability.vue'
import { usePortfolioWorkspace } from '../../composables/workspace/usePortfolioWorkspace'
const workspace = usePortfolioWorkspace()
const selected = computed(
  () =>
    workspace.collection.value.find(
      (entity) => entity.id === workspace.id.value
    ) ?? null
)
</script>
