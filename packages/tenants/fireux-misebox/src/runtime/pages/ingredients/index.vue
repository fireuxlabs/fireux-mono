<template>
  <section class="page">
    <header>
      <h1 class="title">Ingredients</h1>
    </header>
    <MiseObjectsIngredientCreateSystem class="create" />
    <div v-if="ingredients.length" class="cards">
      <MiseObjectsIngredientCardsCell
        v-for="i in ingredients"
        :key="i.id"
        :ingredient="i"
      />
    </div>
    <p v-else class="empty">No ingredients yet.</p>
  </section>
</template>
<script setup lang="ts">
import { useIngredient } from '../../composables/firestore/objects/ingredients/useIngredient'
const { all: ingredients } = await useIngredient()
definePageMeta({ title: 'Ingredients' })
</script>
