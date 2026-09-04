<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-purchasing">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Purchasing">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo capability="purchasing"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools capability="purchasing" />
          <WorkspaceKitchenCapabilityAI
            capability="purchasing"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenCapabilityView capability="purchasing" />
          <WorkspaceKitchenCapabilityGuidingLiterature
            capability="purchasing"
          />
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
