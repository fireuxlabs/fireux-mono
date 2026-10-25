<template>
  <div>
    <WorkspaceKitchenAICapabilityInfo capability="performance" />
    <section class="workspace-surface">
      <UPageHeader title="Service report" />
      <UAlert
        title="Not connected yet"
        description="Order timing and service performance are not connected into this report yet."
        color="warning"
        variant="subtle"
      />
      <MoleculesDisclosurePanel
        title="Capability reference"
        :default-open="false"
      >
        <WorkspaceKitchenToolsToolbar capability="performance" />
        <WorkspaceKitchenAICapability
          capability="performance"
          :show-suggestion-cards="false"
        />
        <WorkspaceKitchenResearchCapabilitySummary capability="performance" />
        <UAlert
          color="neutral"
          variant="soft"
          title="Supported measures only"
          description="Performance comparisons require authoritative service, production, or readiness records. This doorway does not infer labour, productivity, or profit."
        />
        <WorkspaceKitchenResearchGuide capability="performance" />
        <WorkspaceKitchenResearchSegue
          capability="Performance"
          base-path="/workspace/kitchen/reports/performance/search-demand"
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
    key: 'workspace-kitchen-performance',
    label: 'Service',
    group: 'Reports',
    hidden: true,
    groupIcon: 'i-lucide-chart-no-axes-combined',
    icon: 'i-lucide-gauge',
    position: 'top',
    order: 71,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
