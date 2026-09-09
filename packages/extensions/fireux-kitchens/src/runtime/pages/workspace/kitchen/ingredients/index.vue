<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-ingredients">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Ingredients">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo capability="ingredients"
          /></template>
        </LayoutsWorkspaceNavbar>

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
          <WorkspaceKitchenCapabilityTools capability="ingredients" />
          <WorkspaceKitchenCapabilityAI capability="ingredients" />
          <WorkspaceKitchenCapabilityView capability="ingredients" />
          <WorkspaceKitchenIngredients />
          <WorkspaceKitchenCapabilityGuidingLiterature
            capability="ingredients"
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
import { provideKitchenIngredientsContext } from '../../../../kitchen/composables/workspace/ingredients/useKitchenIngredientsContext'

const { canWrite } = provideKitchenIngredientsContext()

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-ingredients',
    label: 'Ingredients',
    group: 'Menus & Recipes',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-utensils',
    icon: 'i-lucide-carrot',
    position: 'top',
    order: 33,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
