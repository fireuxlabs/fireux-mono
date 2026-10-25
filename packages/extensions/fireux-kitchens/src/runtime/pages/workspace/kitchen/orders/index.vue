<template>
  <WorkspacePageLinks />
</template>
<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-orders',
    label: 'Orders',
    description: 'View and manage customer orders.',
    groupIndex: true,
    group: '',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {
        label: 'Order board',
        to: '/workspace/kitchen/orders/board',
        icon: 'i-lucide-panels-top-left',
      },
    ],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
