<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-performance">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Performance" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOperationsCapabilityTools operation="performance" />
          <WorkspaceKitchenOperationsCapabilityAI
            operation="performance"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenOperationsCapabilityView operation="performance" />
          <UAlert
            color="neutral"
            variant="soft"
            title="Supported measures only"
            description="Performance comparisons require authoritative service, production, or readiness records. This doorway does not infer labour, productivity, or profit."
          />
          <WorkspaceKitchenOperationsGuidingLiterature operation="performance" />
          <WorkspaceKitchenResearchSegue
            capability="Performance"
            base-path="/workspace/kitchen/performance/search-demand"
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
    key: 'workspace-kitchen-performance',
    label: 'Performance',
    group: 'Reports',
    icon: 'i-lucide-gauge',
    position: 'top',
    order: 43,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
