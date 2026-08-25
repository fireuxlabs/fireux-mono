<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-costs">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Costs">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo operation="costs"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="costs" />
          <WorkspaceKitchenCapabilityAI
            operation="costs"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenCapabilityView operation="costs" />
          <UAlert
            color="neutral"
            variant="soft"
            title="Cost evidence is derived"
            description="This doorway does not claim profit or accounting measures. Cost reporting becomes available only from authoritative Recipe, Ingredient, purchase-price, and activity records."
          />
          <WorkspaceKitchenCapabilityGuidingLiterature operation="costs" />
          <WorkspaceKitchenResearchSegue
            capability="Costs"
            base-path="/workspace/kitchen/costs/search-demand"
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
    key: 'workspace-kitchen-costs',
    label: 'Costs',
    group: 'Reports',
    icon: 'i-lucide-calculator',
    position: 'top',
    order: 41,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
