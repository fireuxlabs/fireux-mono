<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-receiving">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Receiving" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOperationsCapabilityTools operation="receiving" />
          <WorkspaceKitchenOperationsCapabilityAI
            operation="receiving"
            :show-suggestion-cards="false"
          />
          <WorkspaceKitchenOperationsCapabilityView operation="receiving" />
          <WorkspaceKitchenOperationsGuidingLiterature operation="receiving" />
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
