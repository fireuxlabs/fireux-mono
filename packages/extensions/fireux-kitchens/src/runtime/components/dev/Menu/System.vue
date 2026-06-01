<template>
  <section class="space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-2">
          <div class="text-sm font-semibold">Menu stack (demo scenario)</div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Canon kitchen scenario for mise, recipes, dishes, and menus.
          </p>
        </div>
      </template>

      <div class="flex flex-wrap gap-2 text-xs text-dimmed">
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
import { getDefaultDemoKitchen } from '../../../composables/fireux/app/utils/kitchen-demo-scenarios';

defineOptions({ name: 'DevMenuStackSystem' })

const demoKitchenScenario = getDefaultDemoKitchen()

const counts = computed(() => ({
  mise: demoKitchenScenario.menuStack.miseTasks.length,
  recipes: demoKitchenScenario.menuStack.recipes.length,
  dishes: demoKitchenScenario.menuStack.dishes.length,
  menus: demoKitchenScenario.menuStack.menus.length,
}))

const menuStackDevJson = computed(() => ({
  mise: demoKitchenScenario.menuStack.miseTasks,
  recipes: demoKitchenScenario.menuStack.recipes,
  dishes: demoKitchenScenario.menuStack.dishes,
  menus: demoKitchenScenario.menuStack.menus,
  stations: demoKitchenScenario.menuStack.stations,
}))
</script>
