<template>
  <WorkspacePageLinks />
</template>
<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
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
    group: '',
    groupIndex: true,
    icon: 'i-lucide-package',
    position: 'top',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {
        label: 'Stock',
        to: '/workspace/kitchen/stock/inventory',
        icon: 'i-lucide-boxes',
      },
      {
        label: 'Purchase orders',
        to: '/workspace/kitchen/stock/purchasing',
        icon: 'i-lucide-shopping-cart',
      },
      {
        label: 'Deliveries',
        to: '/workspace/kitchen/stock/receiving',
        icon: 'i-lucide-package-check',
      },
      {
        label: 'Suppliers',
        to: '/workspace/kitchen/stock/suppliers',
        icon: 'i-lucide-truck',
      },
      {
        label: 'Waste',
        to: '/workspace/kitchen/stock/waste',
        icon: 'i-lucide-trash-2',
      },
    ],
  },
})
</script>
