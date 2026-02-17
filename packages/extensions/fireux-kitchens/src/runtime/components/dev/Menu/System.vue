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
import { getDefaultReadOnlyKitchenScenario } from '../../../dev/read-only-scenarios';

defineOptions({ name: 'DevMenuStackSystem' })

const readOnlyKitchenScenario = getDefaultReadOnlyKitchenScenario()

const counts = computed(() => ({
  ingredients: readOnlyKitchenScenario.globalIngredients.length,
  mise: readOnlyKitchenScenario.stacks.menu.miseTasks.length,
  recipes: readOnlyKitchenScenario.stacks.menu.recipes.length,
  dishes: readOnlyKitchenScenario.stacks.menu.dishes.length,
  menus: readOnlyKitchenScenario.stacks.menu.menus.length,
}))

const menuStackDevJson = computed(() => ({
  ingredients: [...readOnlyKitchenScenario.globalIngredients],
  mise: readOnlyKitchenScenario.stacks.menu.miseTasks,
  recipes: readOnlyKitchenScenario.stacks.menu.recipes,
  dishes: readOnlyKitchenScenario.stacks.menu.dishes,
  menus: readOnlyKitchenScenario.stacks.menu.menus,
  stations: readOnlyKitchenScenario.stacks.menu.stations,
}))
</script>
