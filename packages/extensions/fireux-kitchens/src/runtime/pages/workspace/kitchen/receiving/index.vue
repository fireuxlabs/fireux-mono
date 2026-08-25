<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-receiving">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Receiving">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo operation="receiving"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="receiving" />
          <WorkspaceKitchenCapabilityAI
            operation="receiving"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenCapabilityView operation="receiving" />
          <WorkspaceKitchenCapabilityGuidingLiterature operation="receiving" />
          <WorkspaceKitchenResearchSegue
            capability="Receiving"
            base-path="/workspace/kitchen/receiving/search-demand"
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
    key: 'workspace-kitchen-receiving',
    label: 'Receiving',
    group: 'Operations',
    icon: 'i-lucide-package-check',
    position: 'top',
    order: 25,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
