<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-inventory">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Inventory">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo capability="inventory"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools capability="inventory" />
          <WorkspaceKitchenCapabilityAI
            capability="inventory"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenCapabilityView capability="inventory" />
          <WorkspaceKitchenCapabilityGuidingLiterature capability="inventory" />
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
