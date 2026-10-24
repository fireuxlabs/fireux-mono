<template>
  <WorkspaceCapability
    id="workspace-entity-controls"
    collection-label="Suppliers"
    single-label="Details"
  >
    <template #collection-panel
      ><WorkspaceSupplierHomeCollection :workspace="workspace"
    /></template>
    <template #single-panel
      ><WorkspaceSupplierHomeSingle
        :entity="selected"
        :outcome="workspace.collectionOutcome.value"
    /></template>
  </WorkspaceCapability>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceCapability from 'fireux-core/runtime/workspace/components/Capability.vue'
import { useSupplierWorkspace } from '../../composables/workspace/useSupplierWorkspace'
const workspace = useSupplierWorkspace()
const selected = computed(
  () =>
    workspace.collection.value.find(
      (entity) => entity.id === workspace.id.value
    ) ?? null
)
</script>
