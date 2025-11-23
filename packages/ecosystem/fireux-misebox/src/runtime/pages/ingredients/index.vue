<template>
  <div>
    <div>
      <h1>Ingredients</h1>
      <p>Manage your kitchen ingredients</p>
    </div>

    <div>
      <h2>All Ingredients</h2>
      <div>
        <MiseOrganismsObjectsIngredientCardsCell
          v-for="ingredient in ingredients"
          :key="ingredient.id"
          :ingredient="ingredient"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIngredient } from '../../composables/firestore/objects/ingredients/useIngredient'

const { all: ingredients } = useIngredient()
</script>
