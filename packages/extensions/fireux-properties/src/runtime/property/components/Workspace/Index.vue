<template>
  <WorkspaceCapability
    id="workspace-entity-controls"
    collection-label="Properties"
    single-label="Details"
  >
    <template #collection-panel
      ><WorkspacePropertyHomeCollection :index="index"
    /></template>
    <template #single-panel
      ><WorkspacePropertyHomeSingle :entity="selected"
    /></template>
  </WorkspaceCapability>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import { usePropertyWorkspaceIndex } from '../../composables/workspace/index/usePropertyWorkspaceIndex'
const index = usePropertyWorkspaceIndex()
const selected = computed(
  () =>
    index.collection.value.find(
      (entity) => entity.id === index.selectedId.value
    ) ?? null
)
</script>
