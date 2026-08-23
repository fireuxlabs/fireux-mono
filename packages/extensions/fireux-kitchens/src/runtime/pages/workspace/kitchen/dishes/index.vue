<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-dishes">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Dishes" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOperationsCapabilityTools operation="dishes" />
          <WorkspaceKitchenOperationsCapabilityAI operation="dishes" />
          <WorkspaceKitchenOperationsCapabilityView operation="dishes" />
          <WorkspaceKitchenOperationsDishes />
          <WorkspaceKitchenOperationsGuidingLiterature operation="dishes" />
          <WorkspaceKitchenResearchSegue
            capability="Dishes"
            base-path="/workspace/kitchen/dishes/search-demand"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenDishesWorkspace } from '../../../../kitchen/composables/workspace/operations/Dishes/useKitchenDishesWorkspace'

provideKitchenDishesWorkspace()

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-dishes',
    label: 'Dishes',
    group: 'Food & Drink',
    icon: 'i-lucide-utensils',
    position: 'top',
    order: 11,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
