<template><WorkspaceKitchenOrdersPage view="all" /></template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-orders',
    label: 'Orders',
    group: '',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      { label: 'All orders', to: '/workspace/kitchen/orders' },
      { label: 'Offerings', to: '/workspace/kitchen/offerings' },
      { label: 'Kitchen queue', to: '/workspace/kitchen/orders/queue' },
      { label: 'Pass & handoff', to: '/workspace/kitchen/orders/pass' },
      { label: 'Tables', to: '/workspace/kitchen/orders/tables' },
    ],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
