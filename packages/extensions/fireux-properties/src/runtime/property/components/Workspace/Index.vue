<template>
  <WorkspaceCapability
    id="workspace-entity-controls"
    collection-label="Properties"
    single-label="Details"
  >
    <template #collection-panel
      ><WorkspacePropertyHomeCollection :workspace="workspace"
    /></template>
    <template #single-panel
      ><WorkspacePropertyHomeSingle
        :entity="selected"
        :outcome="workspace.collectionOutcome.value"
    /></template>
  </WorkspaceCapability>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceCapability from 'fireux-core/runtime/workspace/components/Capability.vue'
import { usePropertyWorkspace } from '../../composables/workspace/usePropertyWorkspace'
const workspace = usePropertyWorkspace()
const selected = computed(
  () =>
    workspace.collection.value.find(
      (entity) => entity.id === workspace.id.value
    ) ?? null
)
</script>
