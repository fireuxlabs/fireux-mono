<template>
  <section class="space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-2">
          <div class="text-sm font-semibold">Dash dev (read-only scenario)</div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Canon kitchen scenario data set for ingredients, mise, recipes, dishes, and menus.
          </p>
        </div>
      </template>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-xs text-dimmed">
        <UBadge variant="soft">Ingredients: {{ counts.ingredients }}</UBadge>
        <UBadge variant="soft">Mise: {{ counts.mise }}</UBadge>
        <UBadge variant="soft">Recipes: {{ counts.recipes }}</UBadge>
        <UBadge variant="soft">Dishes: {{ counts.dishes }}</UBadge>
        <UBadge variant="soft">Menus: {{ counts.menus }}</UBadge>
      </div>
    </UCard>

    <UCard>
      <DevJson
        title="Dash dev (JSON)"
        context="dev kitchens · dash dev"
        :data="dashboardDevJson"
        :default-open="false"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getDefaultReadOnlyKitchenScenario } from '../../../composables/fireux/app/runtime-kitchen/read-only-scenarios';

defineOptions({ name: 'DevDashboardSystem' })

const readOnlyKitchenScenario = getDefaultReadOnlyKitchenScenario()

const counts = computed(() => ({
  ingredients: readOnlyKitchenScenario.globalIngredients.length,
  mise: readOnlyKitchenScenario.menuStack.miseTasks.length,
  recipes: readOnlyKitchenScenario.menuStack.recipes.length,
  dishes: readOnlyKitchenScenario.menuStack.dishes.length,
  menus: readOnlyKitchenScenario.menuStack.menus.length,
}))

const dashboardDevJson = computed(() => ({
  kitchen: readOnlyKitchenScenario.kitchen,
  ingredients: [...readOnlyKitchenScenario.globalIngredients],
  mise: readOnlyKitchenScenario.menuStack.miseTasks,
  recipes: readOnlyKitchenScenario.menuStack.recipes,
  dishes: readOnlyKitchenScenario.menuStack.dishes,
  menus: readOnlyKitchenScenario.menuStack.menus,
}))
</script>
