<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-inventory">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Inventory">
          <template #right
            ><WorkspaceKitchenAICapabilityInfo capability="inventory"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <UPageHeader title="Stock" />
          <UAlert
            title="Not connected yet"
            description="Stock balances and movements are not connected yet. No quantities on hand can be reported from this screen."
            color="warning"
            variant="subtle"
          />
          <MoleculesDisclosurePanel
            title="Capability reference"
            :default-open="false"
          >
            <WorkspaceKitchenToolsToolbar capability="inventory" />
            <WorkspaceKitchenAICapability
              capability="inventory"
              :show-suggestion-cards="false"
            />
            <WorkspaceKitchenResearchCapabilitySummary capability="inventory" />
            <WorkspaceKitchenResearchGuide capability="inventory" />
            <WorkspaceKitchenResearchSegue
              capability="Inventory"
              base-path="/workspace/kitchen/stock/inventory/search-demand"
            />
          </MoleculesDisclosurePanel>
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
    label: 'Stock',
    group: 'Stock & Purchasing',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-boxes',
    icon: 'i-lucide-boxes',
    position: 'top',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
