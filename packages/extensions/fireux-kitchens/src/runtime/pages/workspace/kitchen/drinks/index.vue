<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-drinks">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Drinks" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOperationsDrinksToolMap
            :suggestions="drinkSuggestions"
          />

          <WorkspaceKitchenOperationsDishesTools />

          <WorkspaceKitchenOperationsCapabilityAI
            operation="drinks"
            :suggestions="drinkSuggestions"
            :show-suggestion-cards="false"
          />

          <section class="grid gap-4" aria-labelledby="drinks-content-title">
            <div class="grid gap-1">
              <h2
                id="drinks-content-title"
                class="m-0 text-lg font-semibold text-highlighted"
              >
                Drinks
              </h2>
              <p class="m-0 text-sm text-muted">
                Browse the selected Kitchen's drinks and open any drink for its
                details and tools.
              </p>
            </div>

            <WorkspaceKitchenOperationsDishesRead />
            <WorkspaceKitchenOperationsGuidingLiterature operation="drinks" />
          </section>
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenDishesWorkspace } from '../../../../kitchen/composables/workspace/operations/Dishes/useKitchenDishesWorkspace'
import { computed } from 'vue'
import { buildMissingDrinkImageSuggestions } from '../../../../kitchen/models/operation-suggestions'

const drinksWorkspace = provideKitchenDishesWorkspace('drink')
const drinkSuggestions = computed(() =>
  buildMissingDrinkImageSuggestions(drinksWorkspace.dishes.value)
)

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
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
  requiresAuth: true,
  requiresSelection: true,
})
</script>
