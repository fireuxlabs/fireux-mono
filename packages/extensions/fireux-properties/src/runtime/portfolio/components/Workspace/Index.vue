<template>
  <WorkspaceCapability id="workspace-entity-controls" collection-label="Portfolios" selected-label="In focus">
    <template #collection-panel><WorkspacePortfolioLandingCollection :index="index" /></template>
    <template #selected-panel><WorkspacePortfolioLandingIndividual :entity="selected" /></template>
  </WorkspaceCapability>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import { usePortfolioWorkspaceIndex } from '../../composables/workspace/index/usePortfolioWorkspaceIndex'
const index = usePortfolioWorkspaceIndex()
const selected = computed(() => index.collection.value.find(entity => entity.id === index.selectedId.value) ?? null)
</script>
