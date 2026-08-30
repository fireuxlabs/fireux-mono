<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-drinks">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Drinks">
          <template #right>
            <WorkspaceKitchenCapabilityContextInfo operation="drinks" />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="drinks" />

          <WorkspaceKitchenCapabilityAI
            operation="drinks"
            :suggestions="drinkSuggestions"
            :action-targets="drinkActionTargets"
          />

          <WorkspaceKitchenDishesRead />
          <WorkspaceKitchenCapabilityGuidingLiterature operation="drinks" />
          <WorkspaceKitchenResearchSegue
            capability="Drinks"
            base-path="/workspace/kitchen/drinks/search-demand"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buildMissingDrinkImageSuggestions } from '../../../../kitchen/models/operation-suggestions'
import { provideKitchenDishesWorkspace } from '../../../../kitchen/composables/workspace/Dishes/useKitchenDishesWorkspace'

const drinksWorkspace = provideKitchenDishesWorkspace('drink')
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
    group: 'Food & Drink',
    icon: 'i-lucide-glass-water',
    position: 'top',
    order: 12,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
