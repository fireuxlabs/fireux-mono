<template>
  <section class="space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-2">
          <div class="text-sm font-semibold">Dash dev (demo scenario)</div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Canon kitchen scenario data set for mise, recipes, dishes, and menus.
          </p>
        </div>
      </template>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs text-dimmed">
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
        :data="consoleDevJson"
        :default-open="false"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getDefaultDemoKitchen } from '../../../composables/fireux/demo/kitchen/scenarios';

defineOptions({ name: 'DevConsoleSystem' })

const demoKitchenScenario = getDefaultDemoKitchen()

const counts = computed(() => ({
  mise: demoKitchenScenario.menuStack.miseTasks.length,
  recipes: demoKitchenScenario.menuStack.recipes.length,
  dishes: demoKitchenScenario.menuStack.dishes.length,
  menus: demoKitchenScenario.menuStack.menus.length,
}))

const consoleDevJson = computed(() => ({
  kitchen: demoKitchenScenario.kitchen,
  mise: demoKitchenScenario.menuStack.miseTasks,
  recipes: demoKitchenScenario.menuStack.recipes,
  dishes: demoKitchenScenario.menuStack.dishes,
  menus: demoKitchenScenario.menuStack.menus,
}))
</script>
