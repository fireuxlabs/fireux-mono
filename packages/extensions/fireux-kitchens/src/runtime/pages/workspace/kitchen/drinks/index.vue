<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-drinks">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Drinks">
          <template #right>
            <WorkspaceKitchenCapabilityContextInfo capability="drinks" />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <nav class="flex gap-2" aria-label="Food and drink catalogue">
          <UButton to="/workspace/kitchen/dishes" label="Food" color="neutral" variant="soft" active-variant="solid" />
          <UButton to="/workspace/kitchen/drinks" label="Drinks" color="neutral" variant="soft" active-variant="solid" />
        </nav>
        <WorkspaceKitchenDishesSelector />
        <WorkspaceHero
          title="Food &amp; drinks"
          description="Create and manage Drinks sold by this Kitchen."
        />
        <WorkspaceKitchenCapabilityAI
          capability="drinks"
          :suggestions="drinkSuggestions"
          :action-targets="drinkActionTargets"
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
import { buildMissingDrinkImageSuggestions } from '../../../../kitchen/models/capability-suggestions'
import { provideKitchenDishesContext } from '../../../../kitchen/composables/workspace/dishes/useKitchenDishesContext'
import WorkspaceKitchenDishesDiscovery from '../../../../kitchen/components/Workspace/Dishes/Discovery.vue'
import WorkspaceKitchenDishesCapabilityView from '../../../../kitchen/components/Workspace/Dishes/CapabilityView.vue'
import WorkspaceKitchenDishesSelector from '../../../../kitchen/components/Workspace/Dishes/Selector.vue'
import WorkspaceKitchenDishesTools from '../../../../kitchen/components/Workspace/Dishes/Tools.vue'

const drinksWorkspace = provideKitchenDishesContext('drink')
const drinkSuggestions = computed(() =>
  buildMissingDrinkImageSuggestions(drinksWorkspace.dishes.value)
)
const drinkActionTargets = computed(() =>
  drinksWorkspace.dishes.value
    .filter((drink) => drink.item_kind === 'drink' && Boolean(drink.id))
    .flatMap((drink) =>
      ['kitchen.drinks.update-drink', 'kitchen.drinks.delete-drink'].map(
        (actionId) => ({
          actionId,
          targetId: drink.id,
          label: String(drink.name || 'Untitled Drink').trim(),
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
    key: 'workspace-kitchen-drinks',
    label: 'Drinks',
    group: 'Menus & Recipes',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-utensils',
    icon: 'i-lucide-glass-water',
    position: 'top',
    order: 12,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    hidden: true,
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
