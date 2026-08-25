<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-purchasing">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Purchasing">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo operation="purchasing"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="purchasing" />
          <WorkspaceKitchenCapabilityAI
            operation="purchasing"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenCapabilityView operation="purchasing" />
          <WorkspaceKitchenCapabilityGuidingLiterature operation="purchasing" />
          <WorkspaceKitchenResearchSegue
            capability="Purchasing"
            base-path="/workspace/kitchen/purchasing/search-demand"
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
    key: 'workspace-kitchen-purchasing',
    label: 'Purchasing',
    group: 'Operations',
    icon: 'i-lucide-shopping-cart',
    position: 'top',
    order: 24,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
