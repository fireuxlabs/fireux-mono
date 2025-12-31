<template>
  <div>
    <OrganismsObjectsIngredientCardsCell
      v-for="ingredient in ingredients"
      :key="ingredient.id"
      :ingredient="ingredient"
    />
  </div>
</template>

<script setup lang="ts">
import { useIngredient } from '../../../../../composables/fireux/firestore/objects/ingredient/useIngredient.ts'

const { all: ingredients } = useIngredient()
</script>
