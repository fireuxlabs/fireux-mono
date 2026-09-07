<template>
  <WorkspaceCapability id="workspace-entity-controls" collection-label="Suppliers" selected-label="In focus">
    <template #collection-panel><WorkspaceSupplierLandingCollection :index="index" /></template>
    <template #selected-panel><WorkspaceSupplierLandingIndividual :entity="selected" /></template>
  </WorkspaceCapability>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import { useSupplierWorkspaceIndex } from '../../composables/workspace/index/useSupplierWorkspaceIndex'
const index = useSupplierWorkspaceIndex()
const selected = computed(() => index.collection.value.find(entity => entity.id === index.selectedId.value) ?? null)
</script>
