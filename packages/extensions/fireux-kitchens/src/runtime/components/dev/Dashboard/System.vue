<template>
  <section class="space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-2">
          <div class="text-sm font-semibold">Dash dev (scenario dummy)</div>
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
import { dummyKitchenScenario } from '../../../../../../../../dummy/scenario';

defineOptions({ name: 'DevDashboardSystem' })

const counts = computed(() => ({
  ingredients: dummyKitchenScenario.globalIngredients?.length ?? 0,
  mise: dummyKitchenScenario.menuStack.miseTasks.length,
  recipes: dummyKitchenScenario.menuStack.recipes.length,
  dishes: dummyKitchenScenario.menuStack.dishes.length,
  menus: dummyKitchenScenario.menuStack.menus.length,
}))

const dashboardDevJson = computed(() => ({
  kitchen: dummyKitchenScenario.kitchen,
  ingredients: [...(dummyKitchenScenario.globalIngredients ?? [])],
  mise: dummyKitchenScenario.menuStack.miseTasks,
  recipes: dummyKitchenScenario.menuStack.recipes,
  dishes: dummyKitchenScenario.menuStack.dishes,
  menus: dummyKitchenScenario.menuStack.menus,
}))
</script>
