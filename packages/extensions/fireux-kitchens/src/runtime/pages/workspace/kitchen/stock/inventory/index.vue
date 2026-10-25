<template>
  <div>
    <WorkspaceKitchenAICapabilityInfo capability="inventory" />
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
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
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
