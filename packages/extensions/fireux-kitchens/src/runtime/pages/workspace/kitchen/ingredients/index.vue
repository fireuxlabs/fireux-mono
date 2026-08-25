<template>
  <div>
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
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="ingredients" />
          <WorkspaceKitchenCapabilityAI operation="ingredients" />
          <WorkspaceKitchenCapabilityView operation="ingredients" />
          <WorkspaceKitchenIngredients />
          <WorkspaceKitchenCapabilityGuidingLiterature
            operation="ingredients"
          />
          <WorkspaceKitchenResearchSegue
            capability="Ingredients"
            base-path="/workspace/kitchen/ingredients/search-demand"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenIngredientsWorkspace } from '../../../../kitchen/composables/workspace/Ingredients/useKitchenIngredientsWorkspace'

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
