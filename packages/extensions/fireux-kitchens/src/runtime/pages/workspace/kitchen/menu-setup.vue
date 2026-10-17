<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-menu-setup">
      <template #header
        ><LayoutsWorkspaceNavbar title="Menus"
      /></template>
      <template #body><MenusOverview /></template>
    </UDashboardPanel>
  </div>
</template>
<script setup lang="ts">
import MenusOverview from '../../../kitchen/components/Workspace/Overview/Menus.vue'
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-menu-setup',
    label: 'Menus',
    group: 'Menus',
    groupDisplay: 'nested',
    groupIndex: true,
    groupIcon: 'i-lucide-utensils',
    icon: 'i-lucide-layout-grid',
    position: 'top',
    order: 29,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
})
</script>
