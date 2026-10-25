<template>
  <div>
    <WorkspaceKitchenAICapabilityInfo capability="waste" />
    <section class="workspace-surface">
      <KitchenWasteTools />
      <KitchenWasteAI />
      <KitchenWaste />
      <WorkspaceKitchenResearchSegue
        capability="Waste"
        base-path="/workspace/kitchen/stock/waste/search-demand"
      />
      <KitchenWasteInspection v-if="isDevelopment" />
    </section>
  </div>
</template>

<script setup lang="ts">
const isDevelopment = import.meta.dev

definePageMeta({
  layout: false,
  workspacePage: true,
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
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
