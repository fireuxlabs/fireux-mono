<template>
  <div>
    <div>
      <h1>Ingredients</h1>
      <p>Manage your kitchen ingredients</p>
    </div>

    <div>
      <h2>All Ingredients</h2>
      <div>
        <component
          :is="wrapperFor(ingredient)"
          v-for="ingredient in ingredients"
          :key="ingredient.id"
          v-bind="wrapperPropsFor(ingredient)"
          class="block"
        >
          <IngredientCardsCell :ingredient="ingredient" />
        </component>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIngredient } from '../../composables/fireux/firestore/objects/ingredient/useIngredient'

const { all: ingredients } = useIngredient()

const wrapperFor = (ingredient: { to?: string | null }) =>
  ingredient.to ? 'NuxtLink' : 'div'
const wrapperPropsFor = (ingredient: { to?: string | null }) =>
  ingredient.to ? { to: ingredient.to } : {}
</script>
