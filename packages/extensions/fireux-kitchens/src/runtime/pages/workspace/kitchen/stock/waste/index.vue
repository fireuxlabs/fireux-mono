<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.stock.waste"
    label="Waste"
    context-label="Stock"
  />
  <div>
    <section class="workspace-surface">
      <KitchenWasteTools />

      <KitchenWaste />
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
    key: 'workspace-kitchen-waste',
    label: 'Waste',
    group: 'Stock & Purchasing',
    hidden: true,
    groupIcon: 'i-lucide-boxes',
    icon: 'i-lucide-trash-2',
    position: 'top',
    order: 44,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
