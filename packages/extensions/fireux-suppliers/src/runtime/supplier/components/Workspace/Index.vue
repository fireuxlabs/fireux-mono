<template>
  <WorkspaceCapability
    id="workspace-entity-controls"
    collection-label="Suppliers"
    single-label="Details"
  >
    <template #collection-panel
      ><WorkspaceSupplierHomeCollection :index="index"
    /></template>
    <template #single-panel
      ><WorkspaceSupplierHomeSingle
        :entity="selected"
        :outcome="index.outcome.value"
    /></template>
  </WorkspaceCapability>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceCapability from 'fireux-core/runtime/workspace/components/Capability.vue'
import { useSupplierWorkspaceIndex } from '../../composables/workspace/useSupplierWorkspaceIndex'
const index = useSupplierWorkspaceIndex()
const selected = computed(
  () =>
    index.collection.value.find(
      (entity) => entity.id === index.selectedId.value
    ) ?? null
)
</script>
