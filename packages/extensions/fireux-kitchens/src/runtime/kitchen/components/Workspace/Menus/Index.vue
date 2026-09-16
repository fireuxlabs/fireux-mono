<template>
  <WorkspaceCapability
    v-if="kitchenId"
    collection-label="Menus"
  >
    <template #collection-panel><MenusCollection /></template>
    <template #single-panel><MenusSingle /></template>
    <template #workspace-open-tools><MenusTools /></template>
  </WorkspaceCapability>
  <UAlert
    v-else
    color="neutral"
    variant="soft"
    title="Choose a kitchen"
    :actions="[{ label: 'Choose kitchen', to: workspaceEntryPath }]"
  />
</template>
<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
import MenusCollection from './Collection.vue'
import MenusSingle from './Single.vue'
import MenusTools from './Tools.vue'
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const { kitchenId } = useKitchenMenusContext()
</script>
