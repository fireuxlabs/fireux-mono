<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-suppliers">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Suppliers">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo operation="suppliers"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="suppliers" />
          <WorkspaceKitchenCapabilityAI operation="suppliers" />
          <WorkspaceKitchenCapabilityView operation="suppliers" />
          <WorkspaceKitchenSuppliers />
          <WorkspaceKitchenCapabilityGuidingLiterature operation="suppliers" />
          <WorkspaceKitchenResearchSegue
            capability="Suppliers"
            base-path="/workspace/kitchen/suppliers/search-demand"
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
    key: 'workspace-kitchen-suppliers',
    label: 'Suppliers',
    group: 'Kitchen Setup',
    icon: 'i-lucide-truck',
    position: 'top',
    order: 31,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
