<template>
  <article
    class="min-h-[24rem] rounded-xl border border-default bg-default p-4 shadow-sm sm:p-5"
    aria-label="Dish Recipes preview"
  >
    <p class="fx-type-caption">Recipes</p>
    <h3 class="mt-1 fx-type-card-heading">{{ dish.name }}</h3>

    <div v-if="dish.recipes.length" class="mt-5 grid gap-2">
      <div
        v-for="recipe in dish.recipes"
        :key="recipe.id"
        class="flex items-start justify-between gap-3 rounded-lg bg-elevated/40 p-3"
      >
        <span>
          <strong class="block">{{ recipe.name }}</strong>
          <span>{{ recipe.ingredientCount }} ingredients</span>
        </span>
        <UBadge color="neutral" variant="soft" size="sm">{{
          recipe.yield
        }}</UBadge>
      </div>
    </div>
    <p v-else class="mt-5 fx-type-caption">No recipes.</p>
  </article>
</template>

<script setup lang="ts">
import type { ProductDemoDish } from './types'

defineProps<{
  dish: ProductDemoDish
}>()
</script>
