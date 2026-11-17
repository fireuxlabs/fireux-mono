<template>
  <div>
    <section class="workspace-surface">
      <UPageHeader title="Stock" />
      <WorkspaceKitchenAIFocus
        focus="kitchen-ai.stock.inventory"
        label="Stock"
        context-label="Stock"
      />
      <UAlert
        title="Not connected yet"
        description="Stock balances and movements are not connected yet. No quantities on hand can be reported from this screen."
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
    key: 'workspace-kitchen-inventory',
    label: 'Stock',
    group: 'Stock & Purchasing',
    hidden: true,
    groupIcon: 'i-lucide-boxes',
    icon: 'i-lucide-boxes',
    position: 'top',
    order: 40,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
