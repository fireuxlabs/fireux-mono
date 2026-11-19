<template>
  <KitchenWorkspaceMenuItems />
</template>

<script setup lang="ts">
import KitchenWorkspaceMenuItems from '../../../../../kitchen/components/Workspace/Menu/Items/Index.vue'

definePageMeta({
  layout: 'workspace',

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
    menus: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
