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
        <WorkspaceKitchenDishesSelector />
        <WorkspaceHero
          title="Build your Kitchen Dishes"
          description="Create and manage Food sold by this Kitchen."
        />
        <WorkspaceKitchenCapabilityAI
          operation="dishes"
          :suggestions="dishSuggestions"
          :action-targets="dishActionTargets"
        />
        <WorkspaceKitchenDishes />
        <WorkspaceKitchenDishesTools />
        <WorkspaceKitchenDishesOperations />
        <WorkspaceKitchenDishesDiscovery />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buildMissingDishImageSuggestions } from '../../../../kitchen/models/operation-suggestions'
import { provideKitchenDishesWorkspace } from '../../../../kitchen/composables/workspace/Dishes/useKitchenDishesWorkspace'
import WorkspaceKitchenDishesDiscovery from '../../../../kitchen/components/Workspace/Dishes/Discovery.vue'
import WorkspaceKitchenDishesOperations from '../../../../kitchen/components/Workspace/Dishes/Operations.vue'
import WorkspaceKitchenDishesSelector from '../../../../kitchen/components/Workspace/Dishes/Selector.vue'
import WorkspaceKitchenDishesTools from '../../../../kitchen/components/Workspace/Dishes/Tools.vue'

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
