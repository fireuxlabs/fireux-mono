<template>
  <WorkspaceCapability
    id="workspace-entity-controls"
    collection-label="Portfolios"
    single-label="Details"
  >
    <template #collection-panel
      ><WorkspacePortfolioHomeCollection :index="index"
    /></template>
    <template #single-panel
      ><WorkspacePortfolioHomeSingle
        :entity="selected"
        :outcome="index.outcome.value"
    /></template>
  </WorkspaceCapability>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import { usePortfolioWorkspaceIndex } from '../../composables/workspace/usePortfolioWorkspaceIndex'
const index = usePortfolioWorkspaceIndex()
const selected = computed(
  () =>
    index.collection.value.find(
      (entity) => entity.id === index.selectedId.value
    ) ?? null
)
</script>
