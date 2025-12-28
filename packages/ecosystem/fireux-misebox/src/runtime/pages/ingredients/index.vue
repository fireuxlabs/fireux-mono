<template>
  <div>
    <div>
      <h1>Ingredients</h1>
      <p>Manage your kitchen ingredients</p>
    </div>

    <div>
      <h2>All Ingredients</h2>
      <div>
          <OrganismsObjectsIngredientCardsCell
          v-for="ingredient in ingredients"
          :key="ingredient.id"
          :ingredient="ingredient"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIngredient } from '../../composables/fireux/firestore/objects/ingredient/useIngredient'

const { all: ingredients } = useIngredient()
</script>
