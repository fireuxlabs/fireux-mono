<template>
  <div>
    <WorkspaceKitchenAICapabilityInfo capability="costs" />
    <section class="workspace-surface">
      <UPageHeader title="Food costs" />
      <UAlert
        title="Not connected yet"
        description="Recipe costs, purchase prices and actual usage are not connected into this report yet."
        color="warning"
        variant="subtle"
      />
      <FireDisclosurePanel
        title="Capability reference"
        :default-open="false"
      >
        <WorkspaceKitchenToolsToolbar capability="costs" />
        <WorkspaceKitchenAICapability
          capability="costs"
          :show-suggestion-cards="false"
        />
        <WorkspaceKitchenResearchCapabilitySummary capability="costs" />
        <UAlert
          color="neutral"
          variant="soft"
          title="Cost evidence is derived"
          description="This doorway does not claim profit or accounting measures. Cost reporting becomes available only from authoritative Recipe, Ingredient, purchase-price, and activity records."
        />
        <WorkspaceKitchenResearchGuide capability="costs" />
        <WorkspaceKitchenResearchSegue
          capability="Costs"
          base-path="/workspace/kitchen/reports/costs/search-demand"
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
    key: 'workspace-kitchen-costs',
    label: 'Food costs',
    group: 'Reports',
    hidden: true,
    groupIcon: 'i-lucide-chart-no-axes-combined',
    icon: 'i-lucide-calculator',
    position: 'top',
    order: 72,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
