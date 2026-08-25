<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-waste-report">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Waste Report" />
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="waste-report" />
          <WorkspaceKitchenCapabilityAI
            operation="waste-report"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenCapabilityView operation="waste-report" />
          <UAlert
            color="neutral"
            variant="soft"
            title="Operational evidence first"
            description="This report can summarise only Waste recorded by the Kitchen Waste capability. It does not invent missing quantities, reasons, or costs."
          />
          <WorkspaceKitchenCapabilityGuidingLiterature
            operation="waste-report"
          />
          <WorkspaceKitchenResearchSegue
            capability="Waste Report"
            base-path="/workspace/kitchen/waste-report/search-demand"
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
    key: 'workspace-kitchen-waste-report',
    label: 'Waste',
    group: 'Reports',
    icon: 'i-lucide-recycle',
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
