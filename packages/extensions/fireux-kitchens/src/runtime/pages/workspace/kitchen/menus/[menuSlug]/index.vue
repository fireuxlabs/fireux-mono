<template>
  <UDashboardPanel id="workspace-kitchen-menu-detail">
    <template #header
      ><LayoutsWorkspaceNavbar title="Menu settings"
    /></template>
    <template #body><WorkspaceKitchenMenusMenu /></template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import WorkspaceKitchenMenusMenu from '../../../../../kitchen/components/Workspace/Menus/Menu.vue'
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'detail',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-menu-detail',
    label: 'Menu settings',
    icon: 'i-lucide-list-tree',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
})
</script>
