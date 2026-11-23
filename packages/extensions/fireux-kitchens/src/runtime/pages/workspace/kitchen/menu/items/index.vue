<template>
  <KitchenItemsPage
    :workspace="workspace"
    items-path="/workspace/kitchen/menu/items"
  />
</template>

<script setup lang="ts">
import KitchenItemsPage from '../../../../../kitchen/components/Workspace/Items/Page.vue'
import { useKitchenWorkspace } from '../../../../../kitchen/composables/workspace/useKitchenWorkspace'

definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',

  workspaceHeader: 'content',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-dishes',
    label: 'Items',
    group: 'Menus',
    description: 'Manage the Items used across your Menus.',
    icon: 'i-lucide-sandwich',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: false,
})

const workspace = useKitchenWorkspace()
</script>
