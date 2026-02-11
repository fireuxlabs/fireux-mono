<template>
  <section class="space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-2">
          <div class="text-sm font-semibold">Dash dev (simple dummy)</div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Work-in-progress dashboard data set for ingredients, mise, recipes, dishes, and menus.
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
        :data="dummyMenuStackSimple"
        :default-open="false"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { dummyMenuStackSimple } from '../../../../../../../../dummy/menu-stack.simple.dummy';

defineOptions({ name: 'DevDashboardSystem' })

const counts = computed(() => ({
  ingredients: dummyMenuStackSimple.ingredients.length,
  mise: dummyMenuStackSimple.mise.length,
  recipes: dummyMenuStackSimple.recipes.length,
  dishes: dummyMenuStackSimple.dishes.length,
  menus: dummyMenuStackSimple.menus.length,
}))
</script>
