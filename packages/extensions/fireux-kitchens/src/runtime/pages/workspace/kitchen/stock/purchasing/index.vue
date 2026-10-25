<template>
  <div>
    <WorkspaceKitchenAICapabilityInfo capability="purchasing" />
    <section class="workspace-surface">
      <UPageHeader title="Purchase orders" />
      <UAlert
        title="Not connected yet"
        description="Purchase order creation, approval and supplier transmission are not connected yet."
        color="warning"
        variant="subtle"
      />
      <FireDisclosurePanel
        title="Capability reference"
        :default-open="false"
      >
        <WorkspaceKitchenToolsToolbar capability="purchasing" />
        <WorkspaceKitchenAICapability
          capability="purchasing"
          :show-suggestion-cards="false"
        />
        <WorkspaceKitchenResearchCapabilitySummary capability="purchasing" />
        <WorkspaceKitchenResearchGuide capability="purchasing" />
        <WorkspaceKitchenResearchSegue
          capability="Purchasing"
          base-path="/workspace/kitchen/stock/purchasing/search-demand"
        />
      </FireDisclosurePanel>
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
    key: 'workspace-kitchen-purchasing',
    label: 'Purchase orders',
    group: 'Stock & Purchasing',
    hidden: true,
    groupIcon: 'i-lucide-boxes',
    icon: 'i-lucide-shopping-cart',
    position: 'top',
    order: 41,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
