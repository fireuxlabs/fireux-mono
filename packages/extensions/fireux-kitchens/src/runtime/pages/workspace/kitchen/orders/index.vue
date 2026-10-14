<template>
  <KitchenGroupIndex nav-key="workspace-kitchen-orders">
  </KitchenGroupIndex>
</template>
<script setup lang="ts">
import KitchenGroupIndex from '../../../../kitchen/components/Workspace/GroupIndex.vue'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-orders',
    label: 'Orders',
    description:
      'View orders and configure how customers and staff order.',
    groupIndex: true,
    group: '',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {label:'Order board',to:'/workspace/kitchen/orders/board',icon:'i-lucide-panels-top-left'},
      {label:'Channels',to:'/workspace/kitchen/orders/channels',icon:'i-lucide-waypoints'},
    ],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
