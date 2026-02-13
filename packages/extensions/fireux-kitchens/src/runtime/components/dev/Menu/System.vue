<template>
  <section class="space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-2">
          <div class="text-sm font-semibold">Menu stack (read-only scenario)</div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Canon kitchen scenario for ingredients, mise, recipes, dishes, and menus.
          </p>
        </div>
      </template>

      <div class="flex flex-wrap gap-2 text-xs text-dimmed">
        <UBadge variant="soft">Ingredients: {{ counts.ingredients }}</UBadge>
        <UBadge variant="soft">Mise: {{ counts.mise }}</UBadge>
        <UBadge variant="soft">Recipes: {{ counts.recipes }}</UBadge>
        <UBadge variant="soft">Dishes: {{ counts.dishes }}</UBadge>
        <UBadge variant="soft">Menus: {{ counts.menus }}</UBadge>
      </div>
    </UCard>

    <UCard>
      <DevJson
        title="Menu stack (JSON)"
        context="dev kitchens · scenario menu stack"
        :data="menuStackDevJson"
        :default-open="false"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { dummyKitchenScenario as readOnlyKitchenScenario } from '../../../../../../../../dummy/scenario';

defineOptions({ name: 'DevMenuStackSystem' })

const counts = computed(() => ({
  ingredients: readOnlyKitchenScenario.globalIngredients?.length ?? 0,
  mise: readOnlyKitchenScenario.menuStack.miseTasks.length,
  recipes: readOnlyKitchenScenario.menuStack.recipes.length,
  dishes: readOnlyKitchenScenario.menuStack.dishes.length,
  menus: readOnlyKitchenScenario.menuStack.menus.length,
}))

const menuStackDevJson = computed(() => ({
  ingredients: [...(readOnlyKitchenScenario.globalIngredients ?? [])],
  mise: readOnlyKitchenScenario.menuStack.miseTasks,
  recipes: readOnlyKitchenScenario.menuStack.recipes,
  dishes: readOnlyKitchenScenario.menuStack.dishes,
  menus: readOnlyKitchenScenario.menuStack.menus,
  stations: readOnlyKitchenScenario.menuStack.stations,
}))
</script>
