<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-waste-report">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Waste Report">
          <template #right
            ><WorkspaceKitchenAICapabilityInfo capability="waste-report"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <UPageHeader title="Waste report" />
          <UAlert
            title="Not connected yet"
            description="Waste reporting is not connected yet. Record individual waste events from Stock &amp; Purchasing."
            color="warning"
            variant="subtle"
          />
          <MoleculesDisclosurePanel
            title="Capability reference"
            :default-open="false"
          >
            <WorkspaceKitchenToolsToolbar capability="waste-report" />
            <WorkspaceKitchenAICapability
              capability="waste-report"
              :show-suggestion-cards="false"
            />
            <WorkspaceKitchenResearchCapabilitySummary
              capability="waste-report"
            />
            <UAlert
              color="neutral"
              variant="soft"
              title="Operational evidence first"
              description="This report can summarise only Waste recorded by the Kitchen Waste capability. It does not invent missing quantities, reasons, or costs."
            />
            <WorkspaceKitchenResearchGuide capability="waste-report" />
            <WorkspaceKitchenResearchSegue
              capability="Waste Report"
              base-path="/workspace/kitchen/reports/waste-report/search-demand"
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
    key: 'workspace-kitchen-waste-report',
    label: 'Waste report',
    group: 'Reports',
    hidden: true,
    groupIcon: 'i-lucide-chart-no-axes-combined',
    icon: 'i-lucide-recycle',
    position: 'top',
    order: 73,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
