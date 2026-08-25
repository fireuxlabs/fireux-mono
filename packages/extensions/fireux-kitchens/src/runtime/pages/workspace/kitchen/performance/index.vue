<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-performance">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Performance">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo operation="performance"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="performance" />
          <WorkspaceKitchenCapabilityAI
            operation="performance"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenCapabilityView operation="performance" />
          <UAlert
            color="neutral"
            variant="soft"
            title="Supported measures only"
            description="Performance comparisons require authoritative service, production, or readiness records. This doorway does not infer labour, productivity, or profit."
          />
          <WorkspaceKitchenCapabilityGuidingLiterature
            operation="performance"
          />
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
