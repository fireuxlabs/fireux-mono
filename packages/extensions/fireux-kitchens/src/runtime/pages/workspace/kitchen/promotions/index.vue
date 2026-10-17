<template>
  <UDashboardPanel id="workspace-kitchen-promotions">
    <template #header><LayoutsWorkspaceNavbar title="Promotions" /></template>
    <template #body><WorkspaceKitchenPromotions /></template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
  nav: {
    hidden: true,
    key: 'workspace-kitchen-promotions',
    label: 'Promotions',
    group: 'Menus',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-utensils',
    icon: 'i-lucide-badge-percent',
    position: 'top',
    order: 31,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
})
</script>
