<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-food-safety">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Food Safety" />
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="food-safety" />
          <WorkspaceKitchenCapabilityAI
            operation="food-safety"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenCapabilityView operation="food-safety" />
          <WorkspaceKitchenCapabilityGuidingLiterature
            operation="food-safety"
          />
          <WorkspaceKitchenResearchSegue
            capability="Food Safety"
            base-path="/workspace/kitchen/food-safety/search-demand"
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
    key: 'workspace-kitchen-food-safety',
    label: 'Food Safety',
    group: 'Operations',
    icon: 'i-lucide-shield-check',
    position: 'top',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
