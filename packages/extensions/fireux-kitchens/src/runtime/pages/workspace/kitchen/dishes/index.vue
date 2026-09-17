<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-dishes">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Dishes">
          <template #right
            ><WorkspaceKitchenAICapabilityInfo capability="dishes"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <WorkspaceHero
          title="Food &amp; drinks"
          description="Shape what you serve. Keep your dishes, descriptions and menu-ready details together."
        />
        <WorkspaceKitchenNavigationFood />
        <nav class="flex gap-2" aria-label="Food and drink catalogue">
          <UButton to="/workspace/kitchen/dishes" label="Food" color="neutral" variant="soft" active-variant="solid" />
          <UButton to="/workspace/kitchen/drinks" label="Drinks" color="neutral" variant="soft" active-variant="solid" />
        </nav>
        <WorkspaceKitchenDishesSelector />
        <WorkspaceKitchenAICapability
          capability="dishes"
          :suggestions="dishSuggestions"
          :action-targets="dishActionTargets"
        />
        <WorkspaceKitchenDishes />
        <WorkspaceKitchenDishesTools />
        <WorkspaceKitchenDishesCapabilityView />
        <WorkspaceKitchenDishesDiscovery />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buildMissingDishImageSuggestions } from '../../../../kitchen/models/capability-suggestions'
import { provideKitchenDishesContext } from '../../../../kitchen/composables/workspace/dishes/useKitchenDishesContext'
import WorkspaceKitchenDishesDiscovery from '../../../../kitchen/components/Workspace/Dishes/Discovery.vue'
import WorkspaceKitchenDishesCapabilityView from '../../../../kitchen/components/Workspace/Dishes/CapabilityView.vue'
import WorkspaceKitchenDishesSelector from '../../../../kitchen/components/Workspace/Dishes/Selector.vue'
import WorkspaceKitchenDishesTools from '../../../../kitchen/components/Workspace/Dishes/Tools.vue'

const dishesWorkspace = provideKitchenDishesContext()
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
    label: 'Food & drinks',
    group: 'Menus & Recipes',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-utensils',
    icon: 'i-lucide-utensils',
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
