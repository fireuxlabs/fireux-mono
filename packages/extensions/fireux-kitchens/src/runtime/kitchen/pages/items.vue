<template>
  <KitchenItemsPage
    :workspace="workspace"
    items-path="/workspace/kitchen/items"
  />
</template>

<script setup lang="ts">
import KitchenItemsPage from '../components/Workspace/Items/Page.vue'
import { useKitchenOnlyWorkspace } from '../composables/workspace/useKitchenOnlyWorkspace'

definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: false,
})

const workspace = useKitchenOnlyWorkspace()
</script>
