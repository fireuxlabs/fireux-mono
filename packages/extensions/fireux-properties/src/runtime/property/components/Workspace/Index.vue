<template>
  <WorkspaceCapability id="workspace-entity-controls" collection-label="Properties" selected-label="In focus">
    <template #collection-panel><WorkspacePropertyLandingCollection :index="index" /></template>
    <template #selected-panel><WorkspacePropertyLandingIndividual :entity="selected" /></template>
  </WorkspaceCapability>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import { usePropertyWorkspaceIndex } from '../../composables/workspace/index/usePropertyWorkspaceIndex'
const index = usePropertyWorkspaceIndex()
const selected = computed(() => index.collection.value.find(entity => entity.id === index.selectedId.value) ?? null)
</script>
