<template>
  <UCard as="article" aria-label="Dish Recipes preview">
    <p class="fx-type-caption">Recipes</p>
    <h3 class="fx-type-card-heading">{{ dish.name }}</h3>

    <div v-if="dish.recipes.length" class="pagebody">
      <div v-for="recipe in dish.recipes" :key="recipe.id">
        <span>
          <strong>{{ recipe.name }}</strong>
          <span>{{ recipe.ingredientCount }} ingredients</span>
        </span>
        <UBadge color="neutral" variant="soft" size="sm">{{
          recipe.yield
        }}</UBadge>
      </div>
    </div>
    <p v-else class="fx-type-caption">No recipes.</p>
  </UCard>
</template>

<script setup lang="ts">
import type { ProductDemoDish } from '~/types/product-demo'

defineProps<{
  dish: ProductDemoDish
}>()
</script>
