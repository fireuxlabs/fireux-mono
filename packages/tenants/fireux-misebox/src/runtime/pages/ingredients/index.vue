<template>
  <div class="ingredients-page">
    <!-- Create system at the very top -->
    <div class="create-section mb-6">
      <MiseObjectsIngredientCreateSystem />
    </div>

    <!-- Objects list below -->
    <FireOrganismsObjectsList
      :config="ingredientConfig"
      :filter-composable="useIngredientFilters"
      :objects="ingredients"
      :loading="pending"
      :error="error"
    >
      <template #object-item="{ object, navigate }">
        <div @click="navigate(object)" style="cursor: pointer">
          <MiseObjectsIngredientCardsCell :ingredient="object" />
        </div>
      </template>

      <template #empty-actions>
        <p>Start by adding your first ingredient above!</p>
      </template>
    </FireOrganismsObjectsList>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIngredient } from '../../composables/firestore/objects/ingredients/useIngredient'
import { useIngredientFilters } from '../../composables/objects/useIngredientFilters'
import { ingredientConfig } from '../../models/objects/Ingredient.model'

const { all: ingredients } = useIngredient()
const pending = ref(false)
const error = ref(null)
</script>
