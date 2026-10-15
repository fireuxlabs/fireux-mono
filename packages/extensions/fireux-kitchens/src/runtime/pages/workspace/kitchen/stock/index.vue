<template>
  <WorkspaceKitchenNavigationGroup nav-key="workspace-kitchen-stock"></WorkspaceKitchenNavigationGroup>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-stock',
    label: 'Stock & Purchasing',
    description:
      'Manage stock, purchase orders, deliveries, suppliers and waste.',
    group: 'Stock & Purchasing',
    groupDisplay: 'nested',
    groupIndex: true,
    groupIcon: 'i-lucide-package',
    icon: 'i-lucide-package',
    position: 'top',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
})
</script>
