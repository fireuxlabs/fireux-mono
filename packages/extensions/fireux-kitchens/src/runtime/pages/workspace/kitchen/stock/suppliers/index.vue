<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.stock.suppliers"
    label="Suppliers"
    context-label="Stock"
  />
  <div>
    <section class="workspace-surface">
      <KitchenSuppliersSelector />
      <WorkspaceKitchenToolsToolbar capability="suppliers" />

      <KitchenSuppliers />
    </section>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenWorkspaceSuppliers } from '../../../../../kitchen/composables/workspace/suppliers/useKitchenWorkspaceSuppliers'

provideKitchenWorkspaceSuppliers()

definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-suppliers',
    label: 'Suppliers',
    group: 'Stock & Purchasing',
    hidden: true,
    groupIcon: 'i-lucide-boxes',
    icon: 'i-lucide-truck',
    position: 'top',
    order: 43,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
