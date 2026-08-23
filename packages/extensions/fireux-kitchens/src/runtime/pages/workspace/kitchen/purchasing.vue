<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-purchasing">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Purchasing" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOperationsCapabilityTools operation="purchasing" />
          <WorkspaceKitchenOperationsCapabilityAI
            operation="purchasing"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenOperationsCapabilityView operation="purchasing" />
          <WorkspaceKitchenOperationsGuidingLiterature operation="purchasing" />
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
