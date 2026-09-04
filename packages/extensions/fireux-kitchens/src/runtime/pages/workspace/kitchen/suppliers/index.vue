<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-suppliers">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Suppliers">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo capability="suppliers"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenSuppliersSelector />
          <WorkspaceKitchenCapabilityTools capability="suppliers" />
          <WorkspaceKitchenCapabilityAI capability="suppliers" />
          <WorkspaceKitchenCapabilityView capability="suppliers" />
          <WorkspaceKitchenSuppliers />
          <WorkspaceKitchenCapabilityGuidingLiterature capability="suppliers" />
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
import { provideKitchenWorkspaceSuppliers } from '../../../../kitchen/composables/workspace/Suppliers/useKitchenWorkspaceSuppliers'

provideKitchenWorkspaceSuppliers()

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
