<template>
  <WorkspaceCapability
    v-if="kitchenId"
    collection-label="Menus"
    connected
    v-model:single-open="singleOpen"
  >
    <template #collection-panel
      ><MenusCollection @select="singleOpen = true"
    /></template>
    <template #single-panel><MenusSingle /></template>
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
import { ref, watch } from 'vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
import MenusCollection from './Collection.vue'
import MenusSingle from './Single.vue'
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const { kitchenId, selectedMenuId } = useKitchenMenusContext()
const singleOpen = ref(false)
watch(selectedMenuId, (value, previous) => {
  if (value && previous) singleOpen.value = true
})
watch(kitchenId, () => {
  singleOpen.value = false
})
</script>
