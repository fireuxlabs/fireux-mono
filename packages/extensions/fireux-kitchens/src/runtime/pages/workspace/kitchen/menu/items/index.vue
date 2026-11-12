<template>
  <KitchenMenuItems />
</template>

<script setup lang="ts">
import { provideKitchenItemsContext } from '../../../../../kitchen/composables/workspace/items/useKitchenItemsContext'
provideKitchenItemsContext('all')

definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceHeader: 'content',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
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
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
