<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-performance">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Performance">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo capability="performance"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <UPageHeader title="Service report" />
          <UAlert title="Not connected yet" description="Order timing and service performance are not connected into this report yet." color="warning" variant="subtle" />
          <MoleculesDisclosurePanel title="Capability reference" :default-open="false">
          <WorkspaceKitchenCapabilityTools capability="performance" />
          <WorkspaceKitchenCapabilityAI
            capability="performance"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenCapabilityView capability="performance" />
          <UAlert
            color="neutral"
            variant="soft"
            title="Supported measures only"
            description="Performance comparisons require authoritative service, production, or readiness records. This doorway does not infer labour, productivity, or profit."
          />
          <WorkspaceKitchenCapabilityGuidingLiterature
            capability="performance"
          />
          <WorkspaceKitchenResearchSegue
            capability="Performance"
            base-path="/workspace/kitchen/performance/search-demand"
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
    key: 'workspace-kitchen-performance',
    label: 'Service',
    group: 'Reports',
    groupDisplay: 'nested',
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
