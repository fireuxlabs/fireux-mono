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
  workspaceSurface: 'detail',
  workspaceSwitchTo: '/workspace/kitchen/menu/items',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-dish-detail',
    label: 'Item details',
    icon: 'i-lucide-utensils',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    menus: ['workspace'],
  },
})

const workspace = useKitchenWorkspace()
</script>
