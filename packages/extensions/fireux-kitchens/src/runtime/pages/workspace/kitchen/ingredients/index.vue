<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-ingredients">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Ingredients" />

        <UDashboardToolbar>
          <template #right>
            <UButton
              v-if="canWrite"
              to="/workspace/kitchen/ingredients/add"
              icon="i-lucide-plus"
              size="sm"
            >
              Add ingredient
            </UButton>
          </template>
        </UDashboardToolbar>
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOperationsCapabilityTools operation="ingredients" />
          <WorkspaceKitchenOperationsCapabilityAI operation="ingredients" />
          <WorkspaceKitchenOperationsCapabilityView operation="ingredients" />
          <WorkspaceKitchenOperationsIngredients />
          <WorkspaceKitchenOperationsGuidingLiterature operation="ingredients" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenIngredientsWorkspace } from '../../../../kitchen/composables/workspace/operations/Ingredients/useKitchenIngredientsWorkspace'

const { canWrite } = provideKitchenIngredientsWorkspace()

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-ingredients',
    label: 'Ingredients',
    group: 'Food & Drink',
    icon: 'i-lucide-carrot',
    position: 'top',
    order: 14,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
