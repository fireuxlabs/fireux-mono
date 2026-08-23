<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-inventory">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Inventory" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOperationsCapabilityTools operation="inventory" />
          <WorkspaceKitchenOperationsCapabilityAI
            operation="inventory"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenOperationsCapabilityView operation="inventory" />
          <WorkspaceKitchenOperationsGuidingLiterature operation="inventory" />
          <WorkspaceKitchenResearchSegue
            capability="Inventory"
            base-path="/workspace/kitchen/inventory/search-demand"
          />
        </section>
      </template>
    </UDashboardPanel>
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
    label: 'Inventory',
    group: 'Operations',
    icon: 'i-lucide-boxes',
    position: 'top',
    order: 23,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
