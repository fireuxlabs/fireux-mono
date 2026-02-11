<template>
  <UDashboardPanel id="dashboard-kitchen-recipes">
    <template #header>
      <LayoutsDashboardNavbar title="Recipes" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="flex items-center justify-between gap-2">
                <h2 class="text-base font-semibold">Lumen Recipes</h2>
                <UBadge variant="soft" color="neutral">{{ recipes.length }}</UBadge>
              </div>
              <p class="text-xs text-dimmed">
                Read-only recipe stack for the Lumen Burger board.
              </p>
            </div>
          </template>

          <div v-if="recipes.length" class="space-y-3">
            <div
              v-for="recipe in recipes"
              :key="recipe.id"
              class="rounded-md border border-default p-3"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div class="text-sm font-semibold">{{ recipe.name || recipe.id }}</div>
                  <p class="text-xs text-dimmed">
                    {{ recipe.description || 'No description.' }}
                  </p>
                </div>
                <UBadge variant="soft" color="neutral">{{ recipe.status }}</UBadge>
              </div>

              <div class="mt-2 flex flex-wrap gap-2 text-xs text-dimmed">
                <span>Yield: {{ recipe.yield_qty }} {{ recipe.yield_unit }}</span>
                <span>Prep: {{ recipe.prep_minutes }}m</span>
                <span>Cook: {{ recipe.cook_minutes }}m</span>
              </div>

              <div v-if="recipe.ingredient_lines?.length" class="mt-2 text-xs text-dimmed">
                Ingredients:
                {{ ingredientLineLabel(recipe.ingredient_lines) }}
              </div>

              <div v-if="recipe.steps?.length" class="mt-2 text-xs text-dimmed">
                Steps:
                {{ stepLabel(recipe.steps) }}
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-dimmed">No recipes yet.</p>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../dummy/scenario'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-recipes',
    label: 'Recipes',
    icon: 'i-lucide-book-text',
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const recipes = computed(() => dummyKitchenScenario.menuStack.recipes)

const ingredientLineLabel = (
  lines: Array<{ ingredient_name: string; quantity: number; unit: string }>
) =>
  lines
    .map((line) => `${line.ingredient_name} (${line.quantity} ${line.unit})`)
    .join(', ')

const stepLabel = (steps: Array<{ order: number; title: string }>) =>
  steps
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((step) => `${step.order}. ${step.title}`)
    .join(' / ')
</script>
