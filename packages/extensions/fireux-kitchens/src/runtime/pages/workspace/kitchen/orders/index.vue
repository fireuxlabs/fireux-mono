<template>
  <section class="workspace-surface">
    <WorkspaceKitchenCapabilityTools operation="orders" />
    <WorkspaceKitchenCapabilityAI operation="orders" />
    <WorkspaceKitchenCapabilityView operation="orders" />
    <WorkspaceKitchenOrders />
    <WorkspaceKitchenCapabilityGuidingLiterature operation="orders" />
    <WorkspaceKitchenResearchSegue
      capability="Orders & Service"
      base-path="/workspace/kitchen/orders/search-demand"
    />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'kitchen-orders',
  workspaceSurface: 'live',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-orders',
    label: 'Orders & Service',
    group: 'Operations',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    order: 22,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
