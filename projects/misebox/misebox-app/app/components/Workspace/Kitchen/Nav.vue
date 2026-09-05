<template>
  <LayoutsWorkspaceNavbar title="Kitchen Workspace">
    <template v-if="workspace.id.value" #title>
      <WorkspaceKitchenActive :kitchen="kitchen" />
    </template>
    <template #right>
      <WorkspaceKitchenInfo />
    </template>
  </LayoutsWorkspaceNavbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspace } from 'fireux-kitchens/runtime/kitchen/composables/workspace/core/useKitchenWorkspace'

const workspace = useKitchenWorkspace()
const kitchen = computed(() => ({
  name: workspace.data.value?.name || '',
  tagline: workspace.data.value?.description || '',
  url: workspace.data.value?.image || '',
}))
</script>
