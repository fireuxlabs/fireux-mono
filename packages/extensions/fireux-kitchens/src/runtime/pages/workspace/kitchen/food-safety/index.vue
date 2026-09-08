<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-food-safety">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Food Safety">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo capability="food-safety"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenFoodSafety />
          <MoleculesDisclosurePanel title="Food safety reference" :default-open="false">
          <WorkspaceKitchenCapabilityTools capability="food-safety" />
          <WorkspaceKitchenCapabilityAI
            capability="food-safety"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenCapabilityView capability="food-safety" />
          <WorkspaceKitchenCapabilityGuidingLiterature
            capability="food-safety"
          />
          <WorkspaceKitchenResearchSegue
            capability="Food Safety"
            base-path="/workspace/kitchen/food-safety/search-demand"
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
    key: 'workspace-kitchen-food-safety',
    label: 'Food Safety',
    group: '',
    icon: 'i-lucide-shield-check',
    position: 'top',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [{ label: 'Due checks', to: '/workspace/kitchen/food-safety' }, { label: 'Records', to: '/workspace/kitchen/food-safety?view=records' }, { label: 'Corrective actions', to: '/workspace/kitchen/food-safety?view=actions' }, { label: 'Procedures', to: '/workspace/kitchen/food-safety?view=procedures' }],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
