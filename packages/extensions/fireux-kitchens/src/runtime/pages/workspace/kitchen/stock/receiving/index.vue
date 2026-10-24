<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-receiving">
      <template #header>
        <WorkspaceNavbar title="Kitchen Receiving">
          <template #right
            ><WorkspaceKitchenAICapabilityInfo capability="receiving"
          /></template>
        </WorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <UPageHeader title="Deliveries" />
          <UAlert
            title="Not connected yet"
            description="Incoming goods, receipt checks and stock updates are not connected yet."
            color="warning"
            variant="subtle"
          />
          <MoleculesDisclosurePanel
            title="Capability reference"
            :default-open="false"
          >
            <WorkspaceKitchenToolsToolbar capability="receiving" />
            <WorkspaceKitchenAICapability
              capability="receiving"
              :show-suggestion-cards="false"
            />
            <WorkspaceKitchenResearchCapabilitySummary capability="receiving" />
            <WorkspaceKitchenResearchGuide capability="receiving" />
            <WorkspaceKitchenResearchSegue
              capability="Receiving"
              base-path="/workspace/kitchen/stock/receiving/search-demand"
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
    key: 'workspace-kitchen-receiving',
    label: 'Deliveries',
    group: 'Stock & Purchasing',
    hidden: true,
    groupIcon: 'i-lucide-boxes',
    icon: 'i-lucide-package-check',
    position: 'top',
    order: 42,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
