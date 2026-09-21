<template>
  <UDashboardPanel id="workspace-kitchen-menu-detail">
    <template #header><LayoutsWorkspaceNavbar title="Menu" /></template>
    <template #body><WorkspaceKitchenMenusRecord /></template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import WorkspaceKitchenMenusRecord from '../../../../../kitchen/components/Workspace/Menus/Record.vue'
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
