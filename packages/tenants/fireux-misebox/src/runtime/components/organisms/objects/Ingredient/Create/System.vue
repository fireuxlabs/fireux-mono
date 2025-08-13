<template>
  <form
    @submit.prevent="
      createIngredient(name.trim()).then(() => {
        if (name.trim()) name = ''
      })
    "
  >
    <FireMoleculesFormsStateField
      v-model="name"
      state-key="ingredientNameDraft"
      label="Ingredient Name"
      placeholder="New ingredient"
    />
    <button type="submit" :disabled="creating || !name.trim()">
      {{ creating ? 'Adding...' : 'Add' }}
    </button>
    <span v-if="createError" class="err">{{ createError.message }}</span>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIngredientCreate } from '../../../../../composables/firestore/objects/ingredients/useIngredientCreate'

const { createIngredient, creating, createError } = useIngredientCreate()
const name = ref('')
</script>
