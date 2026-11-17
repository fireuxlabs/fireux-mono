<template>
  <div>
    <section class="workspace-surface">
      <UPageHeader title="Deliveries" />
      <WorkspaceKitchenAIFocus
        focus="kitchen-ai.stock.receiving"
        label="Deliveries"
        context-label="Stock"
      />
      <UAlert
        title="Not connected yet"
        description="Incoming goods, receipt checks and stock updates are not connected yet."
        color="warning"
        variant="subtle"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-receiving',
    label: 'Deliveries',
    group: 'Stock & Purchasing',
    hidden: true,
    groupIcon: 'i-lucide-boxes',
    icon: 'i-lucide-package-check',
    position: 'top',
    order: 42,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
