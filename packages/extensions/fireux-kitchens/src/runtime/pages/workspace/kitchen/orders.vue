<template>
  <div class="flex min-h-full min-w-0 flex-1 flex-col gap-4">
    <WorkspaceKitchenOperationsCapabilityTools operation="orders" />
    <WorkspaceKitchenOperationsCapabilityAI operation="orders" />
    <WorkspaceKitchenOperationsCapabilityView operation="orders" />
    <WorkspaceKitchenOperationsOrders />
    <WorkspaceKitchenOperationsGuidingLiterature operation="orders" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'kitchen-orders',
  workspaceSurface: 'live',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-orders',
    label: 'Orders',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    order: 8,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
