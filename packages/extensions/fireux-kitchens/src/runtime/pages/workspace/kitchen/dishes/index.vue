<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-dishes">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Dishes">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo operation="dishes"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="dishes" />
          <WorkspaceKitchenCapabilityAI
            operation="dishes"
            :suggestions="dishSuggestions"
            :action-targets="dishActionTargets"
          />
          <WorkspaceKitchenCapabilityView operation="dishes" />
          <WorkspaceKitchenDishes />
          <WorkspaceKitchenCapabilityGuidingLiterature operation="dishes" />
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
import { computed } from 'vue'
import { buildMissingDishImageSuggestions } from '../../../../kitchen/models/operation-suggestions'
import { provideKitchenDishesWorkspace } from '../../../../kitchen/composables/workspace/Dishes/useKitchenDishesWorkspace'

const dishesWorkspace = provideKitchenDishesWorkspace()
const dishSuggestions = computed(() =>
  buildMissingDishImageSuggestions(dishesWorkspace.dishes.value)
)
const dishActionTargets = computed(() =>
  dishesWorkspace.dishes.value.flatMap((dish) =>
    ['kitchen.dishes.update-dish', 'kitchen.dishes.delete-dish'].map(
      (actionId) => ({
        actionId,
        targetId: dish.id,
        label: String(dish.name || 'Untitled Dish').trim(),
      })
    )
  )
)

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
