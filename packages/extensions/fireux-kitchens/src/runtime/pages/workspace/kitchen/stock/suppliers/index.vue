<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-suppliers">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Suppliers">
          <template #right
            ><WorkspaceKitchenAICapabilityInfo capability="suppliers"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenSuppliersSelector />
          <WorkspaceKitchenToolsToolbar capability="suppliers" />
          <WorkspaceKitchenAICapability capability="suppliers" />
          <WorkspaceKitchenResearchCapabilitySummary capability="suppliers" />
          <WorkspaceKitchenSuppliers />
          <WorkspaceKitchenResearchGuide capability="suppliers" />
          <WorkspaceKitchenResearchSegue
            capability="Suppliers"
            base-path="/workspace/kitchen/stock/suppliers/search-demand"
          />
        </section>
      </template>
    </UDashboardPanel>
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
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-boxes',
    icon: 'i-lucide-truck',
    position: 'top',
    order: 43,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
